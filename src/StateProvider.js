import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { isConfigured } from "../firebase";
import { saveCloud, saveGuest, watchSession } from "./lib/storage";

export const StateContext = createContext();

const LOAD_FAILED =
  "Couldn’t load your account data. Check your connection and reload. Changes won’t be saved until then.";
const SAVE_FAILED = "Couldn’t save your latest change. Check your connection and reload.";

export const StateProvider = ({ reducer, initialState, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // The last state known to be stored, used to work out what changed.
  const saved = useRef(initialState);
  // Set when an account's data failed to load, so defaults never overwrite it.
  const blocked = useRef(false);

  // Follow sign-in and sign-out: load that account's data (or the guest's).
  useEffect(() => {
    if (!isConfigured) return;
    return watchSession((session, error) => {
      saved.current = session;
      blocked.current = Boolean(error);
      dispatch({ type: "LOAD", payload: { ...session, syncError: error ? LOAD_FAILED : null } });
    });
  }, []);

  // Persist every change: to Firestore when signed in, otherwise to this browser.
  useEffect(() => {
    if (!state.ready || blocked.current) return;
    const prev = saved.current;
    saved.current = state;

    if (!state.user) {
      if (prev.goals !== state.goals || prev.meals !== state.meals || prev.logs !== state.logs)
        saveGuest(state);
      return;
    }
    saveCloud(state.user.uid, prev, state).catch(() =>
      dispatch({ type: "SYNC_ERROR", payload: SAVE_FAILED }),
    );
  }, [state]);

  return React.createElement(
    StateContext.Provider,
    { value: [state, dispatch] },
    children,
  );
};

export const useStateValue = () => useContext(StateContext);
