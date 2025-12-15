import React from "react";
import "../CSS/Meal.css";
function Meal({ Name, Ingredients }) {
  return (
    <div className="meal">
      <div className="information">
        {Name}
        <div className="macro-nutrients">
          {"Macro Nutrients"}
          <div className="nutrients">
            <p>Calories: 1500cal</p>
            <p>Protein: {Ingredients[1]}g</p>
            <p>Carbs: 56g</p>
            <p>Fat: 56g</p>
          </div>
        </div>
        <div className="ingredients">
          <p>{"apples"}</p>
          <p>{"Pears"}</p>
        </div>
      </div>
      <button className="edit-btn">Edit Meal</button>
    </div>
  );
}

export default Meal;
