import React, { useState } from "react";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import { dateKey, newId, round1 } from "../lib/nutrition";

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

function SearchPage() {
  const [, dispatch] = useStateValue();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [food, setFood] = useState(null); // per-100g nutrition of the picked result
  const [loadingId, setLoadingId] = useState(null);
  const [grams, setGrams] = useState("100");

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("loading");
    setFood(null);
    try {
      const data = await api("/search", { query: query.trim(), number: 8 });
      setResults(data.results ?? []);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const pick = async (result) => {
    setLoadingId(result.id);
    try {
      const info = await api(`/${result.id}/information`, { amount: 100, unit: "grams" });
      const nutrient = (name) =>
        info.nutrition?.nutrients?.find((n) => n.name === name)?.amount ?? 0;
      setFood({
        name: titleCase(info.name),
        image: info.image,
        calories: nutrient("Calories"),
        protein: nutrient("Protein"),
        carbs: nutrient("Carbohydrates"),
        fat: nutrient("Fat"),
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
  const scaled = food && {
    calories: round1((food.calories * amount) / 100),
    protein: round1((food.protein * amount) / 100),
    carbs: round1((food.carbs * amount) / 100),
    fat: round1((food.fat * amount) / 100),
  };

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
          <p className="empty-title">No foods found for “{query.trim()}”</p>
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
            Pick a result, set the amount in grams, then add it to today or save it as a meal.
          </p>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
