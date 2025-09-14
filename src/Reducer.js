export const initialState = {
  user: null,
  Meals: [],
  calorie_goal: 0,
  protein_goal: 0,
  fat_goal: 0,
};
export const reducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
    case "ADD_MEAL":
      return state;
  }
};
