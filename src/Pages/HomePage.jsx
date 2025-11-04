import React from "react";
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
      <h1 className="homepage-title">Daily Summary</h1>

      <section className="macros-section">
        <h2 className="section-title">Macros</h2>
        <div className="statistics">
          <div className="macro-card calorie-goal">
            <h3>Calories</h3>
            <div className="progress-wrapper">
              <CircularProgress
                variant="determinate"
                value={25}
                size={90}
                sx={{
                  color: "#3B82F6",
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
              <span className="progress-label">
                {dailyLog.totals.calories}/{calorie_goal}
                <span className="unit">cal</span>
              </span>
            </div>
          </div>

          <div className="macro-card protein-intake">
            <h3>Protein</h3>
            <div className="progress-wrapper">
              <CircularProgress
                variant="determinate"
                value={50}
                size={90}
                sx={{
                  color: "#EF4444", // ✅ Red (Protein)
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
              <span className="progress-label">
                {dailyLog.totals.protein}/{protein_goal}
                <span className="unit">g</span>
              </span>
            </div>
          </div>

          <div className="macro-card fat-intake">
            <h3>Fat</h3>
            <div className="progress-wrapper">
              <CircularProgress
                variant="determinate"
                value={75}
                size={90}
                sx={{
                  color: "#FACC15", // ✅ Yellow (Fat)
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
              <span className="progress-label">
                {dailyLog.totals.fat}/{fat_goal}
                <span className="unit">g</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="actions-section">
        <h2 className="section-title">Other Actions</h2>
        <div className="set-actions">
          <div
            className="action-card adjust-goals"
            onClick={() => handleSubmit("/adjustGoals")}
          >
            <h3>Adjust Goals</h3>
          </div>

          <div
            className="action-card create-meal"
            onClick={() => handleSubmit("/createMeal")}
          >
            <h3>Create Meal</h3>
          </div>

          <div className="action-card track-calories">
            <h3>Track Calories</h3>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
