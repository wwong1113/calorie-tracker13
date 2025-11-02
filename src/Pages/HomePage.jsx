import React, { useContext } from "react";
import "../CSS/HomePage.css";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateValue } from "../StateProvider";

function HomePage() {
  const navigate = useNavigate();
  const [{ calorie_goal, protein_goal, fat_goal, dailyLog }] = useStateValue();
  const handleSubmit = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage">
      <h2>Macros</h2>
      <div className="statistics">
        <div className="calorie-goal">
          <h2>Calorie Goal</h2>
          <CircularProgress variant="determinate" value={25} />
          <div className="calorie-intake">
            {dailyLog.totals.calories}cal/{calorie_goal}cal
          </div>
        </div>
        <div className="protein-intake">
          <h2>Protein Intake</h2>
          <CircularProgress variant="determinate" value={50} />
          <div className="protein-total">
            {dailyLog.totals.calories}g/{protein_goal}g
          </div>
        </div>
        <div className="fat-intake">
          <h2>Fat Intake</h2>
          <CircularProgress variant="determinate" value={75} />
          <div className="fat-total">
            {dailyLog.totals.calories}g/{fat_goal}g
          </div>
        </div>
      </div>
      <div>
        <h2>Other Actions</h2>
        <div className="set-actions">
          <div
            className="adjust-goals"
            onClick={() => handleSubmit("/adjustGoals")}
          >
            <h2>Adjust Goals</h2>
          </div>
          <div
            className="create-meal"
            onClick={() => handleSubmit("/createMeal")}
          >
            <h2>Create Meal</h2>
          </div>
          <div className="track-calories">
            <h2>Track Calories</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
