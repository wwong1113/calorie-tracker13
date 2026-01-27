import React, { useState, useReducer } from "react";
import "../CSS/SearchPage.CSS";
import { reducer, initialState } from "../Reducer.js";
import { StateContext } from "../StateProvider";
import { useStateValue } from "../StateProvider";
function SearchPage() {
  const API_KEY = import.meta.env.VITE_FOOD_API_KEY;
  const [{ dailyLog }, dispatch] = useStateValue();

  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(100);
  const [foodInfo, setFoodInfo] = useState(null);
  const getNutrient = (name) => {
    return (
      foodInfo?.nutrition?.nutrients.find((n) => n.name === name)?.amount || 0
    );
  };

  const addToDailyLog = (event) => {
    event.preventDefault();

    const multiplier = amount / 100;

    dispatch({
      type: "UPDATE_DAILY_LOG",
      payload: {
        calories: getNutrient("Calories") * multiplier,
        protein: getNutrient("Protein") * multiplier,
        fat: getNutrient("Fat") * multiplier,
        carbs: getNutrient("Carbohydrates") * multiplier,
      },
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const searchRes = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${query}&number=1&apiKey=${API_KEY}`
      );
      const searchData = await searchRes.json();

      if (!searchData.results || searchData.results.length === 0) {
        console.log("No results found");
        return;
      }

      const ingredientId = searchData.results[0].id;

      const infoRes = await fetch(
        `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=100&unit=grams&apiKey=${API_KEY}`
      );
      const infoData = await infoRes.json();

      setFoodInfo(infoData);
      console.log(infoData);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="search">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          placeholder="Search for foods"
          onChange={(event) => setQuery(event.target.value)}
          className="search-input"
        />
      </form>

      {foodInfo && (
        <div className="foodCard">
          <h3>{foodInfo.name}</h3>
          {foodInfo.image && (
            <img
              src={`https://spoonacular.com/cdn/ingredients_250x250/${foodInfo.image}`}
              alt={foodInfo.name}
              className="food-image"
            />
          )}
          <p>
            <strong>Calories:</strong>{" "}
            {
              foodInfo.nutrition.nutrients.find((n) => n.name === "Calories")
                ?.amount
            }{" "}
            kcal
          </p>
          <p>
            <strong>Protein:</strong>{" "}
            {
              foodInfo.nutrition.nutrients.find((n) => n.name === "Protein")
                ?.amount
            }{" "}
            g
          </p>
          <p>
            <strong>Carbs:</strong>{" "}
            {
              foodInfo.nutrition.nutrients.find(
                (n) => n.name === "Carbohydrates"
              )?.amount
            }{" "}
            g
          </p>
          <p>
            <strong>Fat:</strong>{" "}
            {foodInfo.nutrition.nutrients.find((n) => n.name === "Fat")?.amount}{" "}
            g
          </p>
          <form className="addToMeal" onSubmit={addToDailyLog}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter grams"
              className="amount"
              min="1"
            />
            <button type="submit">Add To Tracking</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
