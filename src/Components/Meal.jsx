import React, { useState } from "react";
import MacroFields from "./MacroFields";
import { useStateValue } from "../StateProvider";
import { useToast } from "./Toast";
import { dateKey, newId, num } from "../lib/nutrition";

function Meal({ meal }) {
  const [, dispatch] = useStateValue();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(meal.name);
  const [values, setValues] = useState(meal);

  const startEditing = () => {
    setName(meal.name);
    setValues(meal);
    setIsEditing(true);
  };

  const save = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: "UPDATE_MEAL",
      payload: {
        ...meal,
        name: name.trim(),
        calories: num(values.calories),
        protein: num(values.protein),
        carbs: num(values.carbs),
        fat: num(values.fat),
      },
    });
    setIsEditing(false);
  };

  const logToday = () => {
    dispatch({
      type: "ADD_ENTRY",
      date: dateKey(),
      payload: { ...meal, id: newId(), time: Date.now() },
    });
    toast(`Added ${meal.name} to today`);
  };

  const remove = () => {
    dispatch({ type: "DELETE_MEAL", payload: meal.id });
    toast(`Deleted ${meal.name}`, {
      label: "Undo",
      onClick: () => dispatch({ type: "ADD_MEAL", payload: meal }),
    });
  };

  if (isEditing) {
    return (
      <form className="card stack" onSubmit={save}>
        <label className="field" htmlFor={`meal-${meal.id}-name`}>
          <span className="field-label">Meal name</span>
          <input
            id={`meal-${meal.id}-name`}
            className="input"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <MacroFields values={values} onChange={setValues} idPrefix={`meal-${meal.id}`} />
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="card meal">
      <div className="meal-head">
        <div>
          <h3 className="meal-name">{meal.name}</h3>
          {meal.ingredients?.length > 0 && (
            <p className="row-sub">{meal.ingredients.join(", ")}</p>
          )}
        </div>
        <p className="row-value">
          {Math.round(meal.calories)} <small>kcal</small>
        </p>
      </div>
      <dl className="macro-chips">
        {[
          ["protein", "Protein"],
          ["carbs", "Carbs"],
          ["fat", "Fat"],
        ].map(([key, label]) => (
          <div className={`chip chip-${key}`} key={key}>
            <dt>{label}</dt>
            <dd>{meal[key]}g</dd>
          </div>
        ))}
      </dl>
      <div className="meal-actions">
        <button type="button" className="btn btn-tinted" onClick={logToday}>
          Log today
        </button>
        <button type="button" className="btn btn-plain" onClick={startEditing}>
          Edit
        </button>
        <button type="button" className="btn btn-plain danger" onClick={remove}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default Meal;
