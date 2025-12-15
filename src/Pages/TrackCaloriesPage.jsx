import React, { useState } from "react";
import "../CSS/TrackCaloriesPage.css";
import { useStateValue } from "../StateProvider";

const TrackCaloriesPage = () => {
  const [{ dailyLog }, dispatch] = useStateValue();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  const handleAddFood = (e) => {
    e.preventDefault();

    const newFood = {
      id: Date.now(),
      name: foodName || "Unnamed Food",
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
    };

    dispatch({ type: "ADD_TRACKED_FOOD", payload: newFood });
    dispatch({
      type: "UPDATE_DAILY_LOG",
      payload: {
        calories: newFood.calories,
        protein: newFood.protein,
        fat: newFood.fat,
        carbs: newFood.carbs,
      },
    });

    setFoodName("");
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
  };

  const handleRemoveFood = (food) => {
    dispatch({ type: "REMOVE_TRACKED_FOOD", payload: food.id });
    dispatch({
      type: "UPDATE_DAILY_LOG",
      payload: {
        calories: -food.calories,
        protein: -food.protein,
        fat: -food.fat,
        carbs: -food.carbs,
      },
    });
  };

  return (
    <div className="track-calories-page">
      <h2>Track Your Calories</h2>

      <form onSubmit={handleAddFood} className="food-form">
        <input
          type="text"
          placeholder="Food name"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <input
          type="number"
          placeholder="Protein (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        />
        <input
          type="number"
          placeholder="Fat (g)"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
        />
        <input
          type="number"
          placeholder="Carbs (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
        <button type="submit">Add Food</button>
      </form>

      <div className="tracked-foods">
        <h3>Today's Foods</h3>
        {dailyLog.foods && dailyLog.foods.length > 0 ? (
          dailyLog.foods.map((food) => (
            <div key={food.id} className="food-item">
              <span>
                {food.name} — {food.calories} cal | {food.protein}g P |{" "}
                {food.fat}g F | {food.carbs}g C
              </span>
              <button onClick={() => handleRemoveFood(food)}>Remove</button>
            </div>
          ))
        ) : (
          <p>No foods added yet.</p>
        )}
      </div>
    </div>
  );
};

export default TrackCaloriesPage;
