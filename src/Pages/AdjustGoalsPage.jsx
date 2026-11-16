import React, { useState } from "react";
import MacroFields from "../Components/MacroFields";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { macroCalories, num } from "../lib/nutrition";

function AdjustGoalsPage() {
  const [{ goals }, dispatch] = useStateValue();
  const toast = useToast();
  const [values, setValues] = useState(goals);

  const next = {
    calories: Math.round(num(values.calories)),
    protein: Math.round(num(values.protein)),
    carbs: Math.round(num(values.carbs)),
    fat: Math.round(num(values.fat)),
  };
  const changed = Object.keys(next).some((key) => next[key] !== goals[key]);
  const valid = next.calories > 0;
  const fromMacros = macroCalories(next);
  const gap = fromMacros - next.calories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    dispatch({ type: "SET_GOALS", payload: next });
    setValues(next);
    toast("Goals saved");
  };

  return (
    <main className="page page-narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Daily targets</p>
          <h1 className="display">Goals</h1>
        </div>
      </div>

      <form className="card stack" onSubmit={handleSubmit}>
        <MacroFields values={values} onChange={setValues} idPrefix="goal" />
        <p className="hint">
          Your macro goals add up to <strong>{fromMacros.toLocaleString()} kcal</strong>
          {Math.abs(gap) > 50 &&
            `, ${Math.abs(gap).toLocaleString()} ${gap > 0 ? "more" : "less"} than your calorie goal`}
          . Protein and carbs have 4 kcal per gram, fat has 9.
        </p>
        {!valid && (
          <p className="field-error" role="alert">
            Set a calorie goal above 0.
          </p>
        )}
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!changed}
            onClick={() => setValues(goals)}
          >
            Reset
          </button>
          <button type="submit" className="btn btn-primary" disabled={!changed || !valid}>
            Save goals
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdjustGoalsPage;
