import React, { useState } from "react";
import Meal from "../Components/Meal";
import MacroFields from "../Components/MacroFields";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { newId, num } from "../lib/nutrition";

const EMPTY = { calories: "", protein: "", carbs: "", fat: "" };

function CreateMealPage() {
  const [{ meals }, dispatch] = useStateValue();
  const toast = useToast();

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [values, setValues] = useState(EMPTY);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch({
      type: "ADD_MEAL",
      payload: {
        id: newId(),
        name: name.trim(),
        ingredients: ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        calories: num(values.calories),
        protein: num(values.protein),
        carbs: num(values.carbs),
        fat: num(values.fat),
      },
    });
    toast(`Saved ${name.trim()}`);
    setName("");
    setIngredients("");
    setValues(EMPTY);
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Save once, log in one tap</p>
          <h1 className="display">Meals</h1>
        </div>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        <h2 className="title">New meal</h2>
        <label className="field" htmlFor="meal-name">
          <span className="field-label">Meal name</span>
          <input
            id="meal-name"
            className="input"
            type="text"
            autoComplete="off"
            placeholder="Post-workout lunch"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field" htmlFor="meal-ingredients">
          <span className="field-label">
            Ingredients <span className="field-unit">optional, comma separated</span>
          </span>
          <input
            id="meal-ingredients"
            className="input"
            type="text"
            autoComplete="off"
            placeholder="Chicken, rice, avocado"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </label>
        <MacroFields values={values} onChange={setValues} idPrefix="new-meal" />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          Save meal
        </button>
      </form>

      <section aria-label="Your meals">
        <div className="section-head">
          <h2 className="title">Your meals</h2>
        </div>
        {meals.length === 0 ? (
          <div className="card empty">
            <p className="empty-title">No meals saved yet</p>
            <p className="hint">Meals you save here show up under “My meals” when you add food.</p>
          </div>
        ) : (
          <div className="meal-grid">
            {meals.map((meal) => (
              <Meal key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default CreateMealPage;
