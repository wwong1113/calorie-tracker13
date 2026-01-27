import React, { useState } from "react";
import Meal from "../Components/Meal";
import "../CSS/CreateMeal.css";
import { useStateValue } from "../StateProvider"; // adjust path if needed

function CreateMealPage() {
  const [{ Meals }, dispatch] = useStateValue();

  const [food, setFood] = useState("");
  const [mealName, setMealName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newMeal = {
      id: Date.now(),
      name: mealName,
      ingredients: food.split(","), // simple parsing
    };

    dispatch({
      type: "ADD_MEAL",
      payload: newMeal,
    });

    setFood("");
    setMealName("");
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
            onChange={(e) => setFood(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Meal Name</label>
          <input
            type="text"
            value={mealName}
            placeholder="e.g., Post-Workout Lunch"
            onChange={(e) => setMealName(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Meal
        </button>
      </form>

      <div className="meal-list">
        <h2>Your Meals</h2>

        {Meals.map((meal) => (
          <Meal key={meal.id} Name={meal.name} Ingredients={meal.ingredients} />
        ))}
      </div>
    </div>
  );
}

export default CreateMealPage;
