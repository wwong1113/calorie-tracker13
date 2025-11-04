import React, { useState } from "react";
import Meal from "../Components/Meal";
import "../CSS/CreateMeal.css";

function CreateMealPage() {
  const [food, setFood] = useState("");
  const [mealName, setMealName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Food:", food, "Meal Name:", mealName);
  };

  return (
    <div className="create-meal-page">
      <h1 className="page-title">Create Your Meal</h1>

      <form className="meal-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Search for Foods</label>
          <input
            type="text"
            value={food}
            placeholder="e.g., Chicken Breast, Rice, Avocado..."
            onChange={(event) => setFood(event.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Meal Name</label>
          <input
            type="text"
            value={mealName}
            placeholder="e.g., Post-Workout Lunch"
            onChange={(event) => setMealName(event.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Meal
        </button>
      </form>

      <div className="meal-list">
        <h2>Your Meals</h2>
        <Meal Name={"Egg Fried Rice"} Ingredients={[333, 111]} />
      </div>
    </div>
  );
}

export default CreateMealPage;
