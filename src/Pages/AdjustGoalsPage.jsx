import React, { useState, useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/AdjustGoalsPage.css";
import { reducer, initialState } from "../Reducer";
function AdjustGoalsPage() {
  const [query, setQuery] = useState(0);
  const [state, intialState] = useReducer(reducer, initialState);
  const [calories, setCalories] = useState(0);
  const [fats, setFats] = useState(0);
  const [protein, setProtein] = useState(0);
  const changeGoals = (event) => {
    event.preventDefault();
    dispatch({});
  };
  return (
    <div className="adjust-goals-page">
      <div className="goal-adjustment">
        <div className="adjust-calories">
          Adjust Calories
          <input placeholder="Enter new goal" value={calories}></input>
          <button>Confirm</button>
        </div>
        <div className="adjust-protein">
          Adjust Protein
          <input
            placeholder="Enter new goal"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          ></input>
          <button>Confirm</button>
        </div>
        <div className="adjust-fats">
          Adjust Fats
          <input
            placeholder="Enter new goal"
            value={fats}
            onChange={(e) => setFats(Number(e.target.value))}
          ></input>
          <button>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default AdjustGoalsPage;
