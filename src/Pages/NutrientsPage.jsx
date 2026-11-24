import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Ring from "../Components/Ring";
import { useStateValue } from "../StateProvider";
import { dateKey, shiftKey } from "../lib/nutrition";
import {
  GROUPS,
  LIMITS,
  NUTRIENTS,
  SOURCES,
  formatAmount,
  nutrientReport,
  targetsFor,
} from "../lib/nutrients";

// One row of the meter list: name, figure, % and a bar against the target.
function MeterRow({ nutrient, value, target, percent, limit }) {
  const over = limit && percent > 100;
  const met = !limit && percent >= 100;
  const fill = over ? "var(--danger)" : limit ? "var(--neutral)" : "var(--accent)";

  return (
    <li className="meter-row">
      <div className="meter-top">
        <span className="meter-name">{nutrient.label}</span>
        <span className="meter-figure">
          {formatAmount(value, nutrient.unit)}{" "}
          <span className="muted">/ {formatAmount(target, nutrient.unit)}</span>
        </span>
        <span className={`meter-pct${over ? " danger" : ""}`}>
          {percent}%{met && <span className="badge">Met</span>}
          {over && <span className="badge badge-danger">Over</span>}
        </span>
      </div>
      <div className="bar" style={{ "--fill": fill }} aria-hidden="true">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.8 }}
        />
      </div>
    </li>
  );
}

function NutrientsPage() {
  const [{ goals, logs }] = useStateValue();
  const [range, setRange] = useState("today");
  const today = dateKey();
  const targets = targetsFor(goals);

  // Today, or the average over the days logged in the last 7.
  const dates = range === "today" ? [today] : [...Array(7)].map((_, i) => shiftKey(today, -i));
  const loggedDays = dates.filter((d) => logs[d]?.length > 0);
  const entries = loggedDays.flatMap((d) => logs[d]);
  const report = nutrientReport(entries, targets, range === "today" ? 1 : loggedDays.length);
  const missing = report.total - report.withData;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Vitamins & minerals</p>
          <h1 className="display">Nutrients</h1>
        </div>
        <div className="segmented range-toggle" role="tablist" aria-label="Range">
          {[
            ["today", "Today"],
            ["week", "7 days"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={range === id}
              className="segment"
              onClick={() => setRange(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {report.withData === 0 ? (
        <div className="card empty">
          <p className="empty-title">
            No vitamin and mineral data {range === "today" ? "today" : "this week"}
          </p>
          <p className="hint">
            Foods you add from Search, and meals saved from it, carry 14 vitamins and minerals.
            Foods typed in by hand only have calories and macros.
          </p>
          <Link className="btn btn-primary" to="/search">
            Search foods
          </Link>
        </div>
      ) : (
        <>
          <section className="card summary" aria-label="Nutrient score">
            <Ring
              value={report.score}
              goal={100}
              color="var(--accent)"
              label={`Nutrient score ${report.score} out of 100`}
            >
              <span className="ring-number">{report.score}</span>
              <span className="ring-caption">nutrient score</span>
            </Ring>
            <div className="summary-side">
              <p className="summary-line">
                <strong>
                  {report.met} of {NUTRIENTS.length}
                </strong>{" "}
                targets met
                {range === "week" &&
                  `, averaged over ${loggedDays.length} logged ${loggedDays.length === 1 ? "day" : "days"}`}
              </p>
              <p className="hint">
                The score averages your 14 vitamin and mineral targets, each counted up to 100%,
                so a surplus of one can’t make up for missing another.
              </p>
              {missing > 0 && (
                <p className="hint">
                  {missing} of {report.total} foods have no vitamin and mineral data, so your real
                  intake is likely higher.
                </p>
              )}
            </div>
          </section>

          <section className="card stack" aria-labelledby="gaps-title">
            <div>
              <h2 className="title" id="gaps-title">
                Fill the gaps
              </h2>
              <p className="hint">
                {report.gaps.length > 0
                  ? `Your lowest ${range === "today" ? "today" : "this week"}, with foods known to be good sources. Tap one to look it up.`
                  : "Every vitamin and mineral target is met. Nice work."}
              </p>
            </div>
            {report.gaps.length > 0 && (
              <ul className="gap-list">
                {report.gaps.map((n) => (
                  <li key={n.key} className="gap">
                    <div className="gap-head">
                      <span className="row-title">{n.label}</span>
                      <span className="row-sub">{report.percents[n.key]}% of target</span>
                    </div>
                    <div className="source-chips">
                      {SOURCES[n.key].map((food) => (
                        <Link
                          key={food}
                          className="source-chip"
                          to={`/search?q=${encodeURIComponent(food)}`}
                        >
                          {food}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {[...GROUPS.map((g) => [g, NUTRIENTS.filter((n) => n.group === g)]), ["Keep under", LIMITS]].map(
            ([group, list]) => (
              <section className="card" key={group} aria-label={group}>
                <h2 className="title meter-title">{group}</h2>
                <ul className="meter-list">
                  {list.map((n) => (
                    <MeterRow
                      key={n.key}
                      nutrient={n}
                      value={report.totals[n.key]}
                      target={targets[n.key]}
                      percent={report.percents[n.key]}
                      limit={group === "Keep under"}
                    />
                  ))}
                </ul>
              </section>
            ),
          )}
        </>
      )}

      <p className="hint">
        Targets are US Daily Values for adults unless you change them under Goals. This is general
        information, not medical advice. If you take medication or have a health condition, check
        with your doctor before changing your diet.
      </p>
    </main>
  );
}

export default NutrientsPage;
