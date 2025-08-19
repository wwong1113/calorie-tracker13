import React, { createContext, useContext, useReducer } from "react";

export const StateContext = createContext();

export const StateProvider = ({ reducer, initialState, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return React.createElement(
    StateContext.Provider,
    { value: [state, dispatch] },
    children
  );
};

export const useStateValue = () => useContext(StateContext);
