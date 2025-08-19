import React, { useContext } from "react";
import "../CSS/HomePage.css";
import CircularProgress from "@mui/material/CircularProgress";
function HomePage() {
  return (
    <div className="homepage">
      <h2>Macros</h2>
      <div className="statistics">
        <div className="calorie-goal">
          <h2>Calorie Goal</h2>
          <CircularProgress variant="determinate" value={25} />
          <div className="calorie-intake">800cal/1600cal</div>
        </div>
        <div className="protein-intake">
          <h2>Protein Intake</h2>
          <CircularProgress variant="determinate" value={50} />
          <div className="protein-total">89g/120g</div>
        </div>
        <div className="fat-intake">
          <h2>Fat Intake</h2>
          <CircularProgress variant="determinate" value={75} />
          <div className="fat-total">50g/100g</div>
        </div>
      </div>
      <div>
        <h2>Other Actions</h2>
        <div className="set-actions">
          <div className="adjust-goals">
            <h2>Adjust Goals</h2>
          </div>
          <div className="create-meal">
            <h2>Create Meal</h2>
          </div>
          <div className="streak">
            <h2>Streak</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
