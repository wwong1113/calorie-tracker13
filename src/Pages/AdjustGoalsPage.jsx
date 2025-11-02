import React, { useState } from "react";
import "../CSS/AdjustGoalsPage.css";
import { useStateValue } from "../StateProvider";

function AdjustGoalsPage() {
  const [{ calorie_goal, protein_goal, fat_goal }, dispatch] = useStateValue();

  const [calories, setCalories] = useState(calorie_goal);
  const [protein, setProtein] = useState(protein_goal);
  const [fats, setFats] = useState(fat_goal);

  const handleConfirm = (type) => {
    let newGoals = {};
    if (type === "calories") newGoals = { calorie_goal: calories };
    if (type === "protein") newGoals = { protein_goal: protein };
    if (type === "fats") newGoals = { fat_goal: fats };

    dispatch({
      type: "CHANGE_GOALS",
      payload: newGoals,
    });
  };

  return (
    <div className="adjust-goals-page">
      <div className="goal-adjustment">
        <div className="adjust-calories">
          <h3>Adjust Calories</h3>
          <input
            type="text"
            placeholder="Enter new goal"
            onChange={(e) => setCalories(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("calories")}>Confirm</button>
        </div>

        <div className="adjust-protein">
          <h3>Adjust Protein</h3>
          <input
            type="text"
            placeholder="Enter new goal"
            onChange={(e) => setProtein(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("protein")}>Confirm</button>
        </div>

        <div className="adjust-fats">
          <h3>Adjust Fats</h3>
          <input
            type="text"
            placeholder="Enter new goal"
            onChange={(e) => setFats(Number(e.target.value))}
          />
          <button onClick={() => handleConfirm("fats")}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default AdjustGoalsPage;
