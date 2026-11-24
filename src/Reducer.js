import { isConfigured } from "../firebase";
import { defaultData, loadGuest } from "./lib/storage";

// Shape: { user, ready, syncError, goals, meals, supplements, logs, water, taken }
// logs, water and taken are keyed by local date ("2026-11-16").
// With Firebase set up, `ready` stays false until we know who is signed in.
export const initialState = {
  user: null,
  syncError: null,
  ready: !isConfigured,
  ...(isConfigured ? defaultData() : loadGuest()),
};

export const reducer = (state, action) => {
  switch (action.type) {
    // Replace everything when the signed-in account changes.
    case "LOAD":
      return { syncError: null, ...action.payload, ready: true };

    case "SYNC_ERROR":
      return { ...state, syncError: action.payload };

    case "SET_GOALS":
      return { ...state, goals: { ...state.goals, ...action.payload } };

    case "ADD_MEAL":
      return { ...state, meals: [action.payload, ...state.meals] };

    case "UPDATE_MEAL":
      return {
        ...state,
        meals: state.meals.map((meal) =>
          meal.id === action.payload.id ? action.payload : meal,
        ),
      };

    case "DELETE_MEAL":
      return {
        ...state,
        meals: state.meals.filter((meal) => meal.id !== action.payload),
      };

    case "ADD_ENTRY": {
      const day = [...(state.logs[action.date] ?? [])];
      // An index is passed when undoing a removal, to put it back in place.
      day.splice(action.index ?? day.length, 0, action.payload);
      return { ...state, logs: { ...state.logs, [action.date]: day } };
    }

    case "REMOVE_ENTRY": {
      const day = (state.logs[action.date] ?? []).filter(
        (entry) => entry.id !== action.payload,
      );
      return { ...state, logs: { ...state.logs, [action.date]: day } };
    }

    case "SET_WATER":
      return { ...state, water: { ...state.water, [action.date]: Math.max(0, action.payload) } };

    case "ADD_SUPPLEMENT": {
      const list = [...state.supplements];
      list.splice(action.index ?? list.length, 0, action.payload);
      return { ...state, supplements: list };
    }

    case "REMOVE_SUPPLEMENT":
      return {
        ...state,
        supplements: state.supplements.filter((s) => s.id !== action.payload),
      };

    case "TOGGLE_TAKEN": {
      const day = state.taken[action.date] ?? [];
      const next = day.includes(action.payload)
        ? day.filter((id) => id !== action.payload)
        : [...day, action.payload];
      return { ...state, taken: { ...state.taken, [action.date]: next } };
    }

    default:
      return state;
  }
};
