import React, { useState } from "react";
import "../CSS/SearchPage.CSS";
function SearchPage() {
  const API_KEY = "f98bc22a54084cf492be39de62873486";
  const foods = [
    { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: "Orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
    {
      name: "Chicken Breast (100g)",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
  ];
  const [food, setFood] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(food);
  };
  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={food}
          placeholder="Search for foods"
          onChange={(event) => setFood(event.target.value)}
          className="search-input"
        ></input>
      </form>

      <div>
        {foods.map((food, index) => (
          <div key={index}>
            <h3>{food.name}</h3>
            <p>Calories: {food.calories}</p>
            <p>Protein: {food.protein}g</p>
            <p>Carbs: {food.carbs}g</p>
            <p>Fat: {food.fat}g</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
