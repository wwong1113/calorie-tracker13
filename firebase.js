// Firebase setup. Config comes from VITE_FIREBASE_* variables in .env
// (see .env.example). Without them the app still runs, but only in guest
// mode: accounts and sync are switched off.
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: env.VITE_FIREBASE_PROJECT_ID?.trim(),
  appId: env.VITE_FIREBASE_APP_ID?.trim(),
};

export const isConfigured = Boolean(config.apiKey && config.projectId);

let auth = null;
let db = null;

if (isConfigured) {
  const app = initializeApp(config);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    // Keeps a local copy so the log opens instantly and works offline.
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });

  // `npm run dev:emulator` points the app at the local emulators instead of
  // a real project, so you can test sign-up and sync without touching live data.
  if (env.VITE_FIREBASE_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
}

export { auth, db };
