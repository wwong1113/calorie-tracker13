import React, { useState } from "react";
import "../CSS/AdjustGoalsPage.css";
import { useStateValue } from "../StateProvider";

function AdjustGoalsPage() {
  const [{ calorie_goal, protein_goal, fat_goal }, dispatch] = useStateValue();

  const [calories, setCalories] = useState(calorie_goal);
  const [protein, setProtein] = useState(protein_goal);
  const [fats, setFats] = useState(fat_goal);

  const handleConfirm = (type, value) => {
    if (!value || value <= 0) return;

    dispatch({
      type: "CHANGE_GOALS",
      payload:
        type === "calories"
          ? { calorie_goal: value }
          : type === "protein"
          ? { protein_goal: value }
          : { fat_goal: value },
    });
  };

  return (
    <div className="adjust-goals-page">
      <div className="goal-adjustment">
        {/* Calories */}
        <div className="adjust-calories">
          <h3>Daily Calories</h3>
          <p className="current-goal">Current: {calorie_goal} kcal</p>
          <input
            type="text"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("calories", calories)}>
            Save
          </button>
        </div>

        {/* Protein */}
        <div className="adjust-protein">
          <h3>Daily Protein</h3>
          <p className="current-goal">Current: {protein_goal} g</p>
          <input
            type="text"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("protein", protein)}>
            Save
          </button>
        </div>

        {/* Fats */}
        <div className="adjust-fats">
          <h3>Daily Fats</h3>
          <p className="current-goal">Current: {fat_goal} g</p>
          <input
            type="text"
            value={fats}
            onChange={(e) => setFats(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("fats", fats)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AdjustGoalsPage;
