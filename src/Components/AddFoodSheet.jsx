import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sheet from "./Sheet";
import MacroFields from "./MacroFields";
import { useStateValue } from "../StateProvider";
import { useToast } from "./Toast";
import { dayTitle, newId, num } from "../lib/nutrition";

const EMPTY = { calories: "", protein: "", carbs: "", fat: "" };

function AddFoodSheet({ open, onClose, date }) {
  const [{ meals }, dispatch] = useStateValue();
  const toast = useToast();
  const [tab, setTab] = useState("quick");
  const [name, setName] = useState("");
  const [values, setValues] = useState(EMPTY);

  const log = (food) => {
    dispatch({
      type: "ADD_ENTRY",
      date,
      payload: {
        id: newId(),
        time: Date.now(),
        name: food.name,
        calories: num(food.calories),
        protein: num(food.protein),
        carbs: num(food.carbs),
        fat: num(food.fat),
      },
    });
    toast(`Added ${food.name} to ${dayTitle(date).toLowerCase()}`);
    setName("");
    setValues(EMPTY);
    onClose();
  };

  const canSubmit = name.trim() && values.calories !== "";

  return (
    <Sheet open={open} onClose={onClose} title="Add food">
      <div className="segmented" role="tablist">
        {[
          ["quick", "Quick add"],
          ["meals", "My meals"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className="segment"
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "quick" ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) log({ name: name.trim(), ...values });
          }}
        >
          <label className="field" htmlFor="quick-name">
            <span className="field-label">Food</span>
            <input
              id="quick-name"
              className="input"
              type="text"
              autoFocus
              autoComplete="off"
              placeholder="Greek yogurt with berries"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <MacroFields values={values} onChange={setValues} idPrefix="quick" />
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            Add to log
          </button>
          <p className="hint center">
            Don’t know the numbers?{" "}
            <Link to="/search" onClick={onClose}>
              Search foods
            </Link>
          </p>
        </form>
      ) : meals.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No saved meals yet</p>
          <p className="hint">Save meals you eat often and log them in one tap.</p>
          <Link className="btn btn-secondary" to="/createMeal" onClick={onClose}>
            Create a meal
          </Link>
        </div>
      ) : (
        <ul className="list">
          {meals.map((meal) => (
            <li key={meal.id}>
              <button type="button" className="row row-button" onClick={() => log(meal)}>
                <span className="row-main">
                  <span className="row-title">{meal.name}</span>
                  <span className="row-sub">
                    P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
                  </span>
                </span>
                <span className="row-value">
                  {Math.round(meal.calories)} <small>kcal</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

export default AddFoodSheet;
