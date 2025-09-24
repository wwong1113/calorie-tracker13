export const initialState = {
  user: null,
  Meals: [],
  Favourites: [],

  calorie_goal: 0,
  protein_goal: 0,
  fat_goal: 0,
  dailyLog: {
    date: new Date().toISOString().slice(0, 10),
    totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  },
};
export const reducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
    case "ADD_MEAL":
      return {
        ...state,
        Meals: [...state.Meals, action.payload],
      };
    case "ADD_FAVOURITES":
      return {
        ...state,
        Favouirtes: [...state.Favouirtes, action.payload],
      };
    case "ADD_TO_MEAL":
      return {
        ...state,
      };
  }
};
