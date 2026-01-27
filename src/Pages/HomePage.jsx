import React, { useEffect, useState } from "react";
import "../CSS/HomePage.css";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useStateValue } from "../StateProvider";

function HomePage() {
  const navigate = useNavigate();
  const [{ calorie_goal, protein_goal, fat_goal, carb_goal, dailyLog }] =
    useStateValue();

  const calorieProgress =
    calorie_goal > 0
      ? Math.min((dailyLog.totals.calories / calorie_goal) * 100, 100)
      : 0;
  const carbProgress =
    carb_goal > 0
      ? Math.min((dailyLog.totals.carbs / carb_goal) * 100, 100)
      : 0;
  const proteinProgress =
    protein_goal > 0
      ? Math.min((dailyLog.totals.protein / protein_goal) * 100, 100)
      : 0;

  const fatProgress =
    fat_goal > 0 ? Math.min((dailyLog.totals.fat / fat_goal) * 100, 100) : 0;

  const [animatedCalories, setAnimatedCalories] = useState(0);
  const [animatedProtein, setAnimatedProtein] = useState(0);
  const [animatedFat, setAnimatedFat] = useState(0);
  const [animatedCarb, setAnimatedCarb] = useState(0);
  useEffect(() => {
    setAnimatedCalories(0);
    setAnimatedProtein(0);
    setAnimatedFat(0);
    setAnimatedCarb(0);

    const timeout = setTimeout(() => {
      setAnimatedCalories(calorieProgress);
      setAnimatedProtein(proteinProgress);
      setAnimatedFat(fatProgress);
      setAnimatedCarb(carbProgress);
    }, 100);

    return () => clearTimeout(timeout);
  }, [calorieProgress, proteinProgress, fatProgress, carbProgress]);

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
                value={animatedCalories}
                size={90}
                transitionDuration={800}
                sx={{
                  color: "#3B82F6",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
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
                value={animatedProtein}
                size={90}
                transitionDuration={800}
                sx={{
                  color: "#EF4444",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
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
                value={animatedFat}
                size={90}
                transitionDuration={800}
                sx={{
                  color: "#FACC15",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
              <span className="progress-label">
                {dailyLog.totals.fat}/{fat_goal}
                <span className="unit">g</span>
              </span>
            </div>
          </div>
          <div className="macro-card fat-intake">
            <h3>Carbs</h3>
            <div className="progress-wrapper">
              <CircularProgress
                variant="determinate"
                value={animatedCarb}
                size={90}
                transitionDuration={800}
                sx={{
                  color: "#FACC15",
                  "& .MuiCircularProgress-circle": {
                    strokeLinecap: "round",
                  },
                }}
              />
              <span className="progress-label">
                {dailyLog.totals.carbs}/{carb_goal}
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

          <div
            className="action-card track-calories"
            onClick={() => handleSubmit("/trackCalories")}
          >
            <h3>Track Calories</h3>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
