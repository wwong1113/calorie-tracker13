import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isConfigured } from "../../firebase";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { deleteAccount, resetPassword, signIn, signOut, signUp } from "../lib/storage";

function Account({ user }) {
  const [{ meals, logs }] = useStateValue();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const daysLogged = Object.values(logs).filter((day) => day.length > 0).length;

  const handleDelete = async (e) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await deleteAccount(password);
      toast("Account deleted");
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  };

  return (
    <main className="page page-narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="display">{user.name}</h1>
        </div>
      </div>

      <section className="card list">
        <div className="row">
          <span className="row-main">Email</span>
          <span className="row-sub">{user.email}</span>
        </div>
        <div className="row">
          <span className="row-main">Days logged</span>
          <span className="row-sub">{daysLogged}</span>
        </div>
        <div className="row">
          <span className="row-main">Saved meals</span>
          <span className="row-sub">{meals.length}</span>
        </div>
      </section>

      <p className="hint">
        Your goals, meals, and food log are saved to your account. Sign in on any device to see
        them.
      </p>

      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={async () => {
          await signOut();
          toast("Signed out");
        }}
      >
        Sign out
      </button>

      {confirming ? (
        <form className="card stack" onSubmit={handleDelete}>
          <p>
            <strong>Delete this account?</strong> Your goals, meals, and food log will be erased
            everywhere. This can’t be undone.
          </p>
          <label className="field" htmlFor="delete-password">
            <span className="field-label">Enter your password to confirm</span>
            <input
              id="delete-password"
              className="input"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
            />
            {error && (
              <span className="field-error" role="alert">
                {error}
              </span>
            )}
          </label>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setConfirming(false);
                setPassword("");
                setError("");
              }}
            >
              Keep account
            </button>
            <button type="submit" className="btn btn-danger" disabled={!password || pending}>
              {pending ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="btn btn-plain danger btn-block"
          onClick={() => setConfirming(true)}
        >
          Delete account…
        </button>
      )}
    </main>
  );
}

function LoginPage() {
  const [{ user }] = useStateValue();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null); // { field, message }
  const [pending, setPending] = useState(false);
  // True between a successful submit and the account's data arriving.
  const [entering, setEntering] = useState(false);

  const isSignUp = mode === "signup";

  // Once the account has loaded after signing in, go to Today.
  useEffect(() => {
    if (!entering || !user) return;
    toast(isSignUp ? `Welcome, ${user.name}` : `Welcome back, ${user.name}`);
    navigate("/");
  }, [entering, user, isSignUp, toast, navigate]);

  if (user && !entering) return <Account user={user} />;

  if (!isConfigured) {
    return (
      <main className="page page-narrow">
        <div className="page-head centered">
          <div>
            <h1 className="display">Accounts aren’t set up yet</h1>
            <p className="lede">
              Add your Firebase config to <code>.env</code> (see <code>.env.example</code>) and
              restart the dev server. Until then, everything you track is saved in this browser.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (error?.field === key) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await (isSignUp ? signUp(form) : signIn(form));
      setEntering(true);
    } catch (err) {
      setError({ field: err.field, message: err.message });
      setPending(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    try {
      await resetPassword(form.email);
      toast(`If ${form.email.trim()} has an account, a reset link is on its way`);
    } catch (err) {
      setError({ field: err.field, message: err.message });
    }
  };

  const field = (key, label, props) => (
    <label className="field" htmlFor={`auth-${key}`}>
      <span className="field-label">{label}</span>
      <input
        id={`auth-${key}`}
        className="input"
        value={form[key]}
        onChange={set(key)}
        aria-invalid={error?.field === key}
        aria-describedby={error?.field === key ? "auth-error" : undefined}
        required
        {...props}
      />
      {error?.field === key && (
        <span id="auth-error" className="field-error" role="alert">
          {error.message}
        </span>
      )}
    </label>
  );

  return (
    <main className="page page-narrow">
      <div className="page-head centered">
        <div>
          <h1 className="display">{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className="lede">
            {isSignUp
              ? "Keep your goals, meals, and food log with you on every device."
              : "Sign in to pick up where you left off."}
          </p>
        </div>
      </div>

      <form className="card stack" onSubmit={handleSubmit} noValidate>
        <div className="segmented" role="tablist">
          {[
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              className="segment"
              disabled={pending}
              onClick={() => {
                setMode(id);
                setError(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {isSignUp && field("name", "Name", { type: "text", autoComplete: "name", placeholder: "Alex" })}
        {field("email", "Email", {
          type: "email",
          autoComplete: "email",
          placeholder: "you@example.com",
        })}
        {field("password", "Password", {
          type: "password",
          autoComplete: isSignUp ? "new-password" : "current-password",
          placeholder: isSignUp ? "At least 8 characters" : "",
        })}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "One moment…" : isSignUp ? "Create account" : "Sign in"}
        </button>

        {!isSignUp && (
          <button type="button" className="btn btn-plain" disabled={pending} onClick={handleReset}>
            Forgot password?
          </button>
        )}
      </form>

      <p className="hint center">
        You can also use FitTrack without an account. Your data then stays in this browser, and
        moves into your account when you create one.
      </p>
    </main>
  );
}

export default LoginPage;
