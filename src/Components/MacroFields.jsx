import React from "react";

const FIELDS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

// The four number inputs shared by quick add, meals, and goals.
function MacroFields({ values, onChange, idPrefix }) {
  return (
    <div className="macro-fields">
      {FIELDS.map(({ key, label, unit }) => (
        <label className="field" key={key} htmlFor={`${idPrefix}-${key}`}>
          <span className="field-label">
            {label} <span className="field-unit">{unit}</span>
          </span>
          <input
            id={`${idPrefix}-${key}`}
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={values[key]}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}

export default MacroFields;
