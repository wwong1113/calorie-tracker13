import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { dateKey, newId, round1 } from "../lib/nutrition";
import {
  LIMITS,
  NUTRIENTS,
  extractNutrients,
  percentOf,
  scaleNutrients,
  targetsFor,
} from "../lib/nutrients";

const API = "https://api.spoonacular.com/food/ingredients";
const API_KEY = import.meta.env.VITE_FOOD_API_KEY?.trim();

async function api(path, params) {
  const query = new URLSearchParams({ ...params, apiKey: API_KEY });
  const res = await fetch(`${API}${path}?${query}`);
  if (res.status === 402) throw new Error("The daily food search limit has been reached. Try again tomorrow.");
  if (!res.ok) throw new Error("Food search isn’t available right now. Try again in a moment.");
  return res.json();
}

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// 20% of a target or more is "high" in a serving (the FDA's definition).
const HIGH = 20;

function SearchPage() {
  const [{ goals }, dispatch] = useStateValue();
  const toast = useToast();
  // The search term lives in the URL, so Nutrients can link straight to a search.
  const [params, setParams] = useSearchParams();
  const term = params.get("q") ?? "";

  const [query, setQuery] = useState(term);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [food, setFood] = useState(null); // per-100g nutrition of the picked result
  const [loadingId, setLoadingId] = useState(null);
  const [grams, setGrams] = useState("100");

  useEffect(() => {
    setQuery(term);
    setFood(null);
    if (!term) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    api("/search", { query: term, number: 8 })
      .then((data) => {
        if (cancelled) return;
        setResults(data.results ?? []);
        setStatus("done");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [term]);

  const search = (e) => {
    e.preventDefault();
    if (query.trim()) setParams({ q: query.trim() });
  };

  const pick = async (result) => {
    setLoadingId(result.id);
    try {
      const info = await api(`/${result.id}/information`, { amount: 100, unit: "grams" });
      const list = info.nutrition?.nutrients ?? [];
      const nutrient = (name) => list.find((n) => n.name === name)?.amount ?? 0;
      setFood({
        name: titleCase(info.name),
        image: info.image,
        calories: nutrient("Calories"),
        protein: nutrient("Protein"),
        carbs: nutrient("Carbohydrates"),
        fat: nutrient("Fat"),
        nutrients: extractNutrients(list),
      });
      setGrams("100");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    } finally {
      setLoadingId(null);
    }
  };

  const amount = Math.max(0, Number(grams) || 0);
  const factor = amount / 100;
  const scaled = food && {
    calories: round1(food.calories * factor),
    protein: round1(food.protein * factor),
    carbs: round1(food.carbs * factor),
    fat: round1(food.fat * factor),
    nutrients: scaleNutrients(food.nutrients, factor),
  };

  // What this amount is rich in, and anything to watch, against the user's targets.
  const targets = targetsFor(goals);
  const ranked = (list) =>
    scaled
      ? list
          .map((n) => ({ ...n, percent: percentOf(scaled.nutrients[n.key], targets[n.key]) }))
          .filter((n) => n.percent >= HIGH)
          .sort((a, b) => b.percent - a.percent)
      : [];
  const richIn = ranked(NUTRIENTS).slice(0, 5);
  const highIn = ranked(LIMITS);

  const addToLog = () => {
    dispatch({
      type: "ADD_ENTRY",
      date: dateKey(),
      payload: { id: newId(), time: Date.now(), name: `${food.name} (${amount} g)`, ...scaled },
    });
    toast(`Added ${food.name} to today`);
  };

  const saveAsMeal = () => {
    dispatch({
      type: "ADD_MEAL",
      payload: { id: newId(), name: `${food.name} (${amount} g)`, ingredients: [], ...scaled },
    });
    toast(`Saved ${food.name} to your meals`);
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Nutrition per ingredient</p>
          <h1 className="display">Search</h1>
        </div>
      </div>

      <form className="search-form" role="search" onSubmit={search}>
        <input
          className="input search-input"
          type="search"
          aria-label="Search for a food"
          placeholder="Chicken breast, oats, avocado…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!query.trim() || status === "loading"}>
          {status === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {!API_KEY && (
        <p className="notice" role="alert">
          Food search needs an API key. Add <code>VITE_FOOD_API_KEY</code> to your{" "}
          <code>.env</code> file and restart the dev server.
        </p>
      )}

      {status === "error" && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {food && (
        <section className="card food" aria-label={food.name}>
          <div className="food-head">
            {food.image && (
              <img
                className="food-image"
                src={`https://img.spoonacular.com/ingredients_100x100/${food.image}`}
                alt=""
              />
            )}
            <div className="row-main">
              <h2 className="title">{food.name}</h2>
              <p className="row-sub">{Math.round(food.calories)} kcal per 100 g</p>
            </div>
            <label className="field amount-field" htmlFor="grams">
              <span className="field-label">
                Amount <span className="field-unit">g</span>
              </span>
              <input
                id="grams"
                className="input"
                type="number"
                inputMode="decimal"
                min="1"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            </label>
          </div>

          <dl className="stat-grid">
            {[
              ["calories", "Calories", "kcal"],
              ["protein", "Protein", "g"],
              ["carbs", "Carbs", "g"],
              ["fat", "Fat", "g"],
            ].map(([key, label, unit]) => (
              <div className={`stat stat-${key}`} key={key}>
                <dt>{label}</dt>
                <dd>
                  {key === "calories" ? Math.round(scaled[key]) : scaled[key]} <small>{unit}</small>
                </dd>
              </div>
            ))}
          </dl>

          <div className="food-nutrients">
            <p className="field-label">Rich in</p>
            {richIn.length > 0 ? (
              <ul className="nutrient-chips">
                {richIn.map((n) => (
                  <li key={n.key} className="nutrient-chip">
                    {n.label} <strong>{n.percent}%</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint">
                No vitamin or mineral reaches {HIGH}% of your target at {amount} g.
              </p>
            )}
            {highIn.length > 0 && (
              <ul className="nutrient-chips">
                {highIn.map((n) => (
                  <li key={n.key} className="nutrient-chip nutrient-chip-warn">
                    High in {n.label.toLowerCase()} <strong>{n.percent}%</strong>
                  </li>
                ))}
              </ul>
            )}
            <p className="hint">% of your daily target for this amount.</p>
          </div>

          <div className="btn-row">
            <button type="button" className="btn btn-secondary" disabled={amount <= 0} onClick={saveAsMeal}>
              Save as meal
            </button>
            <button type="button" className="btn btn-primary" disabled={amount <= 0} onClick={addToLog}>
              Add to today
            </button>
          </div>
        </section>
      )}

      {status === "done" && results.length === 0 && (
        <div className="card empty">
          <p className="empty-title">No foods found for “{term}”</p>
          <p className="hint">Try a simpler name, like “rice” instead of “leftover fried rice”.</p>
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <ul className="card list" aria-label="Results">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="row row-button"
                disabled={loadingId !== null}
                onClick={() => pick(result)}
              >
                <img
                  className="thumb"
                  src={`https://img.spoonacular.com/ingredients_100x100/${result.image}`}
                  alt=""
                  loading="lazy"
                />
                <span className="row-main">
                  <span className="row-title">{titleCase(result.name)}</span>
                </span>
                <span className="row-sub">{loadingId === result.id ? "Loading…" : "View"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {status === "idle" && (
        <div className="card empty">
          <p className="empty-title">Look up any ingredient</p>
          <p className="hint">
            See its calories, macros and the vitamins and minerals it’s rich in, then add it to
            today or save it as a meal.
          </p>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
