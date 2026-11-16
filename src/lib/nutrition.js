export const MACROS = [
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "fat", label: "Fat" },
];

export const round1 = (n) => Math.round(n * 10) / 10;

// Parse a form value into a non-negative number with one decimal.
export const num = (v) => Math.max(0, round1(Number(v) || 0));

export function sumEntries(entries) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const e of entries) {
    totals.calories += e.calories || 0;
    totals.protein += e.protein || 0;
    totals.carbs += e.carbs || 0;
    totals.fat += e.fat || 0;
  }
  return totals;
}

export const macroCalories = ({ protein, carbs, fat }) =>
  Math.round(num(protein) * 4 + num(carbs) * 4 + num(fat) * 9);

export const newId = () => crypto.randomUUID();

// Dates are keyed by the user's local calendar day, not UTC.
export function dateKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function shiftKey(key, days) {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function dayTitle(key) {
  const today = dateKey();
  if (key === today) return "Today";
  if (key === shiftKey(today, -1)) return "Yesterday";
  return parseKey(key).toLocaleDateString(undefined, { weekday: "long" });
}

export const daySubtitle = (key) =>
  parseKey(key).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const timeLabel = (ts) =>
  new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
