import React, { useState } from "react";
import { motion } from "motion/react";
import { useStateValue } from "../StateProvider";
import { useToast } from "./Toast";
import { newId } from "../lib/nutrition";
import { liters } from "../lib/nutrients";

const GLASS = 250; // ml

export function WaterCard({ date }) {
  const [{ goals, water }, dispatch] = useStateValue();
  const ml = water[date] ?? 0;
  const goal = goals.water;
  const set = (value) => dispatch({ type: "SET_WATER", date, payload: value });

  return (
    <section className="card habit" aria-labelledby="water-title">
      <div className="card-head">
        <h2 className="title" id="water-title">
          Water
        </h2>
        <span className="row-value">
          {liters(ml)} <small>of {liters(goal)}</small>
        </span>
      </div>
      <div
        className="bar"
        style={{ "--fill": "var(--water)" }}
        role="meter"
        aria-label="Water"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={ml}
        aria-valuetext={`${liters(ml)} of ${liters(goal)}`}
      >
        <motion.div
          className="bar-fill"
          initial={false}
          animate={{ width: `${Math.min(goal > 0 ? ml / goal : 0, 1) * 100}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        />
      </div>
      <div className="habit-actions">
        <button
          type="button"
          className="icon-btn icon-btn-filled"
          aria-label="Remove a glass"
          disabled={ml <= 0}
          onClick={() => set(ml - GLASS)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="btn btn-tinted water-add" onClick={() => set(ml + GLASS)}>
          + Glass <small>250 ml</small>
        </button>
      </div>
    </section>
  );
}

export function SupplementsCard({ date }) {
  const [{ supplements, taken }, dispatch] = useStateValue();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const done = new Set(taken[date] ?? []);
  const count = supplements.filter((s) => done.has(s.id)).length;
  const showForm = editing || supplements.length === 0;

  const add = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: "ADD_SUPPLEMENT", payload: { id: newId(), name: name.trim() } });
    setName("");
    // Keep the field open after the first one so several can be added in a row.
    if (supplements.length === 0) setEditing(true);
  };

  const remove = (supplement, index) => {
    dispatch({ type: "REMOVE_SUPPLEMENT", payload: supplement.id });
    toast(`Removed ${supplement.name}`, {
      label: "Undo",
      onClick: () => dispatch({ type: "ADD_SUPPLEMENT", index, payload: supplement }),
    });
  };

  return (
    <section className="card habit" aria-labelledby="supplements-title">
      <div className="card-head">
        <h2 className="title" id="supplements-title">
          Supplements
        </h2>
        {supplements.length > 0 && (
          <div className="card-head-end">
            {!editing && (
              <span className="row-value">
                {count} <small>of {supplements.length}</small>
              </span>
            )}
            <button type="button" className="btn btn-plain btn-small" onClick={() => setEditing(!editing)}>
              {editing ? "Done" : "Edit"}
            </button>
          </div>
        )}
      </div>

      {supplements.length === 0 && (
        <p className="hint">Add what you take each day, then tick it off as you go.</p>
      )}

      {supplements.length > 0 && (
        <ul className="checklist">
          {supplements.map((s, index) =>
            editing ? (
              <li key={s.id} className="check-row">
                <span className="check-name">{s.name}</span>
                <button
                  type="button"
                  className="btn btn-plain btn-small danger"
                  onClick={() => remove(s, index)}
                >
                  Remove
                </button>
              </li>
            ) : (
              <li key={s.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done.has(s.id)}
                  className="check-row check-button"
                  onClick={() => dispatch({ type: "TOGGLE_TAKEN", date, payload: s.id })}
                >
                  <span className="check-box" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="check-name">{s.name}</span>
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={add}>
          <input
            className="input"
            type="text"
            aria-label="Supplement name"
            placeholder="Vitamin D3, omega-3…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" disabled={!name.trim()}>
            Add
          </button>
        </form>
      )}
    </section>
  );
}
