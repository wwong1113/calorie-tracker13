import React, { useState } from "react";
import MacroFields from "../Components/MacroFields";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { macroCalories, num } from "../lib/nutrition";
import { ALL_NUTRIENTS, GROUPS, LIMITS, NUTRIENTS, targetsFor } from "../lib/nutrients";

const MACROS = ["calories", "protein", "carbs", "fat"];

// The form shows strings; goals store numbers.
const toForm = (goals) => ({
  macros: Object.fromEntries(MACROS.map((k) => [k, String(goals[k])])),
  water: String(goals.water / 1000),
  targets: Object.fromEntries(
    Object.entries(targetsFor(goals)).map(([k, v]) => [k, String(v)]),
  ),
});

// Only targets that differ from the Daily Value are stored.
const toGoals = (form) => ({
  ...Object.fromEntries(MACROS.map((k) => [k, Math.round(num(form.macros[k]))])),
  water: Math.round(num(form.water) * 1000),
  nutrients: Object.fromEntries(
    ALL_NUTRIENTS.filter((n) => {
      const v = num(form.targets[n.key]);
      return v > 0 && v !== n.dv;
    }).map((n) => [n.key, num(form.targets[n.key])]),
  ),
});

const sameGoals = (a, b) =>
  [...MACROS, "water"].every((k) => a[k] === b[k]) &&
  ALL_NUTRIENTS.every(
    (n) => (a.nutrients?.[n.key] ?? n.dv) === (b.nutrients?.[n.key] ?? n.dv),
  );

function TargetField({ nutrient, value, onChange }) {
  const id = `target-${nutrient.key}`;
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {nutrient.label} <span className="field-unit">{nutrient.unit}</span>
      </span>
      <input
        id={id}
        className="input"
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        placeholder={String(nutrient.dv)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AdjustGoalsPage() {
  const [{ goals }, dispatch] = useStateValue();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(goals));

  const next = toGoals(form);
  const changed = !sameGoals(next, goals);
  const valid = next.calories > 0 && next.water > 0;
  const fromMacros = macroCalories(next);
  const gap = fromMacros - next.calories;
  const usingDefaults = ALL_NUTRIENTS.every((n) => num(form.targets[n.key]) === n.dv);

  const setTarget = (key) => (value) =>
    setForm({ ...form, targets: { ...form.targets, [key]: value } });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    dispatch({ type: "SET_GOALS", payload: next });
    setForm(toForm({ ...goals, ...next }));
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

      <form className="stack goals-form" onSubmit={handleSubmit}>
        <section className="card stack" aria-labelledby="macros-title">
          <h2 className="title" id="macros-title">
            Calories & macros
          </h2>
          <MacroFields
            values={form.macros}
            onChange={(macros) => setForm({ ...form, macros })}
            idPrefix="goal"
          />
          <p className="hint">
            Your macro goals add up to <strong>{fromMacros.toLocaleString()} kcal</strong>
            {Math.abs(gap) > 50 &&
              `, ${Math.abs(gap).toLocaleString()} ${gap > 0 ? "more" : "less"} than your calorie goal`}
            . Protein and carbs have 4 kcal per gram, fat has 9.
          </p>
        </section>

        <section className="card stack" aria-labelledby="water-goal-title">
          <h2 className="title" id="water-goal-title">
            Water
          </h2>
          <label className="field water-field" htmlFor="goal-water">
            <span className="field-label">
              Daily water <span className="field-unit">L</span>
            </span>
            <input
              id="goal-water"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.water}
              onChange={(e) => setForm({ ...form, water: e.target.value })}
            />
          </label>
        </section>

        <section className="card stack" aria-labelledby="targets-title">
          <div className="card-head">
            <h2 className="title" id="targets-title">
              Vitamins & minerals
            </h2>
            <button
              type="button"
              className="btn btn-plain btn-small"
              disabled={usingDefaults}
              onClick={() =>
                setForm({
                  ...form,
                  targets: Object.fromEntries(ALL_NUTRIENTS.map((n) => [n.key, String(n.dv)])),
                })
              }
            >
              Use Daily Values
            </button>
          </div>
          <p className="hint">
            Start from the US Daily Values and adjust for your age, sex, or your doctor’s advice.
            Leave a field blank to use the Daily Value.
          </p>
          {[...GROUPS.map((g) => [g, NUTRIENTS.filter((n) => n.group === g)]), ["Keep under", LIMITS]].map(
            ([group, list]) => (
              <fieldset className="target-group" key={group}>
                <legend className="field-label">{group}</legend>
                <div className="target-grid">
                  {list.map((n) => (
                    <TargetField
                      key={n.key}
                      nutrient={n}
                      value={form.targets[n.key]}
                      onChange={setTarget(n.key)}
                    />
                  ))}
                </div>
              </fieldset>
            ),
          )}
        </section>

        {!valid && (
          <p className="field-error" role="alert">
            Set calorie and water goals above 0.
          </p>
        )}
        <div className="btn-row save-bar">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!changed}
            onClick={() => setForm(toForm(goals))}
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
