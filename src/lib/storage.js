// Where data lives:
// - Signed out ("guest"): this browser's localStorage.
// - Signed in: Firestore, under users/{uid} (goals, meals, supplements) and
//   users/{uid}/days/{date} (that day's food entries, water, supplements taken).
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "../../firebase";

const GUEST_KEY = "fittrack.data:guest";

export const defaultData = () => ({
  goals: { calories: 2000, protein: 120, carbs: 220, fat: 65, water: 2000, nutrients: {} },
  meals: [],
  supplements: [],
  logs: {}, // date -> food entries
  water: {}, // date -> ml drunk
  taken: {}, // date -> ids of supplements taken
});

const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

// Fills in anything missing, so data saved by older versions still loads.
function shape(saved = {}) {
  const base = defaultData();
  return {
    goals: { ...base.goals, ...obj(saved.goals), nutrients: obj(saved.goals?.nutrients) },
    meals: Array.isArray(saved.meals) ? saved.meals : [],
    supplements: Array.isArray(saved.supplements) ? saved.supplements : [],
    logs: obj(saved.logs),
    water: obj(saved.water),
    taken: obj(saved.taken),
  };
}

/* ---------- Guest data (localStorage) ---------- */

export function loadGuest() {
  try {
    return shape(JSON.parse(localStorage.getItem(GUEST_KEY)) ?? {});
  } catch {
    // Unreadable or blocked storage: start from defaults.
    return defaultData();
  }
}

export function saveGuest({ goals, meals, supplements, logs, water, taken }) {
  try {
    localStorage.setItem(
      GUEST_KEY,
      JSON.stringify({ goals, meals, supplements, logs, water, taken }),
    );
  } catch {
    // Storage full or blocked: the app keeps working in memory.
  }
}

/* ---------- Account data (Firestore) ---------- */

const userDoc = (uid) => doc(db, "users", uid);
const daysCol = (uid) => collection(db, "users", uid, "days");

export async function loadCloud(uid) {
  const [profile, days] = await Promise.all([getDoc(userDoc(uid)), getDocs(daysCol(uid))]);
  const logs = {};
  const water = {};
  const taken = {};
  days.forEach((day) => {
    const d = day.data();
    if (d.entries?.length) logs[day.id] = d.entries;
    if (d.water) water[day.id] = d.water;
    if (d.taken?.length) taken[day.id] = d.taken;
  });
  return shape({ ...profile.data(), logs, water, taken });
}

// Writes only what changed between two states, so adding one food
// touches one small document instead of re-uploading everything.
export async function saveCloud(uid, prev, next) {
  const batch = writeBatch(db);
  let writes = 0;

  if (["goals", "meals", "supplements"].some((key) => prev[key] !== next[key])) {
    batch.set(
      userDoc(uid),
      { goals: next.goals, meals: next.meals, supplements: next.supplements },
      { merge: true },
    );
    writes++;
  }

  const dates = new Set([
    ...Object.keys(next.logs),
    ...Object.keys(next.water),
    ...Object.keys(next.taken),
  ]);
  for (const date of dates) {
    const same = ["logs", "water", "taken"].every((key) => prev[key]?.[date] === next[key][date]);
    if (same) continue;
    const day = {
      entries: next.logs[date] ?? [],
      water: next.water[date] ?? 0,
      taken: next.taken[date] ?? [],
    };
    const ref = doc(daysCol(uid), date);
    if (day.entries.length || day.water || day.taken.length) batch.set(ref, day);
    else batch.delete(ref);
    writes++;
  }

  if (writes > 0) await batch.commit();
}

/* ---------- Auth ---------- */

const toUser = (fbUser) => ({
  uid: fbUser.uid,
  email: fbUser.email,
  name: fbUser.displayName || fbUser.email.split("@")[0],
});

function fieldError(field, message) {
  const err = new Error(message);
  err.field = field;
  return err;
}

// Turns Firebase error codes into a plain message next to the right field.
function friendly(err) {
  if (err.field) return err;
  switch (err.code) {
    case "auth/email-already-in-use":
      return fieldError("email", "An account with this email already exists.");
    case "auth/invalid-email":
      return fieldError("email", "Enter a valid email address.");
    case "auth/weak-password":
      return fieldError("password", "Choose a stronger password.");
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return fieldError("password", "Email or password is incorrect.");
    case "auth/too-many-requests":
      return fieldError("password", "Too many attempts. Wait a few minutes and try again.");
    case "auth/network-request-failed":
      return fieldError("password", "Can’t reach the server. Check your connection.");
    case "auth/operation-not-allowed":
      return fieldError("password", "Email sign-in isn’t turned on for this Firebase project.");
    default:
      return fieldError("password", "Something went wrong. Try again.");
  }
}

// While an account is being created, the auth listener waits for this so it
// loads the finished account (name set, guest data moved in), not an empty one.
let pendingSignUp = null;

// Calls back with ({ user, ...data }) whenever the signed-in account changes,
// and with an error as the second argument if that account's data can't load.
export function watchSession(callback) {
  let latest = 0;
  return onAuthStateChanged(auth, async (fbUser) => {
    const request = ++latest;
    await pendingSignUp?.catch(() => {});
    if (!fbUser) return callback({ user: null, ...loadGuest() });
    try {
      const data = await loadCloud(fbUser.uid);
      // Ignore a slow load if the account changed again in the meantime.
      if (request === latest) callback({ user: toUser(fbUser), ...data });
    } catch (err) {
      if (request === latest) callback({ user: toUser(fbUser), ...defaultData() }, err);
    }
  });
}

export async function signUp({ name, email, password }) {
  name = name.trim();
  email = email.trim();
  if (!name) throw fieldError("name", "Enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw fieldError("email", "Enter a valid email address.");
  if (password.length < 8) throw fieldError("password", "Use at least 8 characters.");

  pendingSignUp = (async () => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    // Anything tracked before signing up comes along into the new account.
    await saveCloud(user.uid, defaultData(), loadGuest());
    localStorage.removeItem(GUEST_KEY);
  })();

  try {
    await pendingSignUp;
  } catch (err) {
    throw friendly(err);
  } finally {
    pendingSignUp = null;
  }
}

export async function signIn({ email, password }) {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (err) {
    throw friendly(err);
  }
}

export const signOut = () => firebaseSignOut(auth);

export async function resetPassword(email) {
  email = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw fieldError("email", "Enter your email first, then choose “Forgot password?”.");
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    // Don't reveal whether an address has an account.
    if (err.code !== "auth/user-not-found") throw friendly(err);
  }
}

// Erases the account and everything stored for it. Asks for the password
// again because Firebase only allows deletion right after signing in.
export async function deleteAccount(password) {
  const user = auth.currentUser;
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
    const days = await getDocs(daysCol(user.uid));
    const batch = writeBatch(db);
    days.forEach((day) => batch.delete(day.ref));
    batch.delete(userDoc(user.uid));
    await batch.commit();
    await deleteUser(user);
  } catch (err) {
    throw friendly(err);
  }
}
