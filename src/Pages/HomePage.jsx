import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import Ring from "../Components/Ring";
import AddFoodSheet from "../Components/AddFoodSheet";
import { SupplementsCard, WaterCard } from "../Components/DailyHabits";
import { useStateValue } from "../StateProvider";
import { useToast } from "../Components/Toast";
import {
  MACROS,
  dateKey,
  daySubtitle,
  dayTitle,
  shiftKey,
  sumEntries,
  timeLabel,
} from "../lib/nutrition";
import { nutrientReport, targetsFor } from "../lib/nutrients";

// Counts toward the new value instead of jumping to it.
function AnimatedNumber({ value }) {
  const spring = useSpring(value, { bounce: 0, duration: 600 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString());
  useEffect(() => spring.set(value), [spring, value]);
  return <motion.span>{text}</motion.span>;
}

const Chevron = ({ flip }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path
      d={flip ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function HomePage() {
  const location = useLocation();
  const [{ goals, logs }, dispatch] = useStateValue();
  const toast = useToast();
  const [date, setDate] = useState(dateKey);
  const [adding, setAdding] = useState(Boolean(location.state?.add));

  const entries = logs[date] ?? [];
  const totals = sumEntries(entries);
  const remaining = Math.round(goals.calories - totals.calories);
  const isToday = date === dateKey();
  const nutrients = nutrientReport(entries, targetsFor(goals));

  const remove = (entry, index) => {
    dispatch({ type: "REMOVE_ENTRY", date, payload: entry.id });
    toast(`Removed ${entry.name}`, {
      label: "Undo",
      onClick: () => dispatch({ type: "ADD_ENTRY", date, index, payload: entry }),
    });
  };

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{daySubtitle(date)}</p>
          <h1 className="display">{dayTitle(date)}</h1>
        </div>
        <div className="day-nav">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous day"
            onClick={() => setDate(shiftKey(date, -1))}
          >
            <Chevron />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next day"
            disabled={isToday}
            onClick={() => setDate(shiftKey(date, 1))}
          >
            <Chevron flip />
          </button>
        </div>
      </div>

      <section className="card summary" aria-label="Daily summary">
        <Ring
          value={totals.calories}
          goal={goals.calories}
          color="var(--calories)"
          label={`${Math.round(totals.calories)} of ${goals.calories} calories eaten`}
        >
          <span className="ring-number">
            <AnimatedNumber value={Math.abs(remaining)} />
          </span>
          <span className="ring-caption">
            {remaining >= 0 ? "kcal left" : "kcal over"}
          </span>
        </Ring>

        <div className="summary-side">
          <p className="summary-line">
            <strong>
              <AnimatedNumber value={totals.calories} />
            </strong>{" "}
            of {goals.calories.toLocaleString()} kcal eaten
          </p>
          {MACROS.map(({ key, label }) => {
            const goal = goals[key];
            const pct = goal > 0 ? Math.min(totals[key] / goal, 1) : 0;
            return (
              <div className="macro" key={key}>
                <div className="macro-top">
                  <span className="macro-name">{label}</span>
                  <span className="macro-value">
                    <strong>{Math.round(totals[key])}</strong> / {goal} g
                  </span>
                </div>
                <div className="bar" style={{ "--fill": `var(--${key})` }}>
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
          <Link to="/nutrients" className="score-link">
            {nutrients.withData > 0 ? (
              <>
                <span>Nutrient score</span>
                <strong>{nutrients.score}</strong>
              </>
            ) : (
              <span>Track vitamins & minerals</span>
            )}
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      <section aria-label="Food log">
        <div className="section-head">
          <h2 className="title">Food log</h2>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            <span aria-hidden="true">+</span> Add food
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="card empty">
            <p className="empty-title">Nothing logged {isToday ? "yet" : "this day"}</p>
            <p className="hint">Add what you ate to see your calories and macros fill in.</p>
          </div>
        ) : (
          <ul className="card list">
            <AnimatePresence initial={false}>
              {entries.map((entry, index) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                >
                  <div className="row">
                    <span className="row-main">
                      <span className="row-title">{entry.name}</span>
                      <span className="row-sub">
                        {timeLabel(entry.time)} · P {entry.protein}g · C {entry.carbs}g · F{" "}
                        {entry.fat}g
                      </span>
                    </span>
                    <span className="row-value">
                      {Math.round(entry.calories)} <small>kcal</small>
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${entry.name}`}
                      onClick={() => remove(entry, index)}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path
                          d="M5 5l14 14M19 5L5 19"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <div className="habits">
        <WaterCard date={date} />
        <SupplementsCard date={date} />
      </div>

      <AddFoodSheet open={adding} onClose={() => setAdding(false)} date={date} />
    </main>
  );
}

export default HomePage;
