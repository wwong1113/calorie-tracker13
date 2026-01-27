export const initialState = {
  user: null,
  Meals: [],
  Favourites: [],
  calorie_goal: 1000,
  protein_goal: 50,
  fat_goal: 50,
  carb_goal: 100,
  dailyLog: {
    date: new Date().toISOString().slice(0, 10),
    totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
  },
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_MEAL":
      return {
        ...state,
        Meals: [...state.Meals, action.payload],
      };

    case "CHANGE_GOALS":
      return {
        ...state,
        calorie_goal: action.payload.calorie_goal ?? state.calorie_goal,
        protein_goal: action.payload.protein_goal ?? state.protein_goal,
        fat_goal: action.payload.fat_goal ?? state.fat_goal,
        carb_goal: action.payload.carb_goal ?? state.carb_goal,
      };

    case "UPDATE_DAILY_LOG":
      return {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          totals: {
            calories:
              state.dailyLog.totals.calories + (action.payload.calories || 0),
            protein:
              state.dailyLog.totals.protein + (action.payload.protein || 0),
            fat: state.dailyLog.totals.fat + (action.payload.fat || 0),
            carbs: state.dailyLog.totals.carbs + (action.payload.carbs || 0),
          },
        },
      };

    default:
      return state;
  }
};
