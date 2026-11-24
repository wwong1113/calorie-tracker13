// Vitamins and minerals tracked from food search data.
// Targets default to the US FDA Daily Values for adults. Vitamin A uses the
// older IU-based value (5,000 IU) because the food database reports it in IU.
export const NUTRIENTS = [
  { key: "vitaminA", label: "Vitamin A", api: "Vitamin A", unit: "IU", dv: 5000, group: "Vitamins" },
  { key: "vitaminC", label: "Vitamin C", api: "Vitamin C", unit: "mg", dv: 90, group: "Vitamins" },
  { key: "vitaminD", label: "Vitamin D", api: "Vitamin D", unit: "µg", dv: 20, group: "Vitamins" },
  { key: "vitaminE", label: "Vitamin E", api: "Vitamin E", unit: "mg", dv: 15, group: "Vitamins" },
  { key: "vitaminK", label: "Vitamin K", api: "Vitamin K", unit: "µg", dv: 120, group: "Vitamins" },
  { key: "folate", label: "Folate", api: "Folate", unit: "µg", dv: 400, group: "Vitamins" },
  { key: "vitaminB12", label: "Vitamin B12", api: "Vitamin B12", unit: "µg", dv: 2.4, group: "Vitamins" },
  { key: "fiber", label: "Fiber", api: "Fiber", unit: "g", dv: 28, group: "Minerals & fiber" },
  { key: "calcium", label: "Calcium", api: "Calcium", unit: "mg", dv: 1300, group: "Minerals & fiber" },
  { key: "iron", label: "Iron", api: "Iron", unit: "mg", dv: 18, group: "Minerals & fiber" },
  { key: "magnesium", label: "Magnesium", api: "Magnesium", unit: "mg", dv: 420, group: "Minerals & fiber" },
  { key: "potassium", label: "Potassium", api: "Potassium", unit: "mg", dv: 4700, group: "Minerals & fiber" },
  { key: "zinc", label: "Zinc", api: "Zinc", unit: "mg", dv: 11, group: "Minerals & fiber" },
  { key: "selenium", label: "Selenium", api: "Selenium", unit: "µg", dv: 55, group: "Minerals & fiber" },
];

// Things to stay under rather than reach.
export const LIMITS = [
  { key: "sodium", label: "Sodium", api: "Sodium", unit: "mg", dv: 2300, group: "Keep under" },
  { key: "saturatedFat", label: "Saturated fat", api: "Saturated Fat", unit: "g", dv: 20, group: "Keep under" },
];

export const ALL_NUTRIENTS = [...NUTRIENTS, ...LIMITS];

export const GROUPS = ["Vitamins", "Minerals & fiber"];

// Well-known whole-food sources, used as search suggestions for gaps.
export const SOURCES = {
  vitaminA: ["sweet potato", "carrot", "spinach", "kale", "cantaloupe"],
  vitaminC: ["red bell pepper", "kiwi", "orange", "broccoli", "strawberries"],
  vitaminD: ["salmon", "trout", "sardines", "eggs", "milk"],
  vitaminE: ["sunflower seeds", "almonds", "avocado", "spinach", "peanut butter"],
  vitaminK: ["kale", "spinach", "broccoli", "brussels sprouts", "cabbage"],
  folate: ["lentils", "spinach", "asparagus", "chickpeas", "avocado"],
  vitaminB12: ["clams", "salmon", "beef", "eggs", "yogurt"],
  fiber: ["lentils", "chia seeds", "raspberries", "black beans", "oats"],
  calcium: ["yogurt", "sardines", "tofu", "kale", "milk"],
  iron: ["lentils", "spinach", "beef", "pumpkin seeds", "tofu"],
  magnesium: ["pumpkin seeds", "almonds", "spinach", "black beans", "dark chocolate"],
  potassium: ["potato", "white beans", "banana", "spinach", "avocado"],
  zinc: ["oysters", "beef", "pumpkin seeds", "chickpeas", "cashews"],
  selenium: ["tuna", "sardines", "eggs", "sunflower seeds", "turkey"],
};

const r2 = (n) => Math.round(n * 100) / 100;

// Picks the tracked nutrients out of a food database nutrient list.
export function extractNutrients(apiList = []) {
  const out = {};
  for (const n of ALL_NUTRIENTS) {
    out[n.key] = r2(apiList.find((item) => item.name === n.api)?.amount ?? 0);
  }
  return out;
}

export const scaleNutrients = (nutrients, factor) =>
  nutrients &&
  Object.fromEntries(Object.entries(nutrients).map(([key, v]) => [key, r2(v * factor)]));

// The user's own target where set, otherwise the Daily Value.
export const targetsFor = (goals) =>
  Object.fromEntries(
    ALL_NUTRIENTS.map((n) => {
      const custom = Number(goals.nutrients?.[n.key]);
      return [n.key, custom > 0 ? custom : n.dv];
    }),
  );

export const percentOf = (value, target) => (target > 0 ? Math.round((value / target) * 100) : 0);

// Totals, % of target, and a 0-100 score for a set of food entries.
// `days` averages the totals when entries span several days.
export function nutrientReport(entries, targets, days = 1) {
  const withData = entries.filter((e) => e.nutrients);
  const totals = {};
  const percents = {};
  for (const n of ALL_NUTRIENTS) {
    const sum = withData.reduce((s, e) => s + (e.nutrients[n.key] || 0), 0);
    totals[n.key] = sum / Math.max(days, 1);
    percents[n.key] = percentOf(totals[n.key], targets[n.key]);
  }
  // Each target counts up to 100%, so a mountain of vitamin K can't hide missing iron.
  const score = Math.round(
    NUTRIENTS.reduce((s, n) => s + Math.min(percents[n.key], 100), 0) / NUTRIENTS.length,
  );
  const met = NUTRIENTS.filter((n) => percents[n.key] >= 100).length;
  const gaps = NUTRIENTS.filter((n) => percents[n.key] < 100)
    .sort((a, b) => percents[a.key] - percents[b.key])
    .slice(0, 3);
  return { totals, percents, score, met, gaps, withData: withData.length, total: entries.length };
}

export function formatAmount(value, unit) {
  const v =
    value >= 100 ? Math.round(value) : value >= 10 ? Math.round(value * 10) / 10 : r2(value);
  return `${v.toLocaleString()} ${unit}`;
}

export const liters = (ml) => `${+(ml / 1000).toFixed(2)} L`;
