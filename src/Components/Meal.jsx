import React from "react";

function Meal({ Name, Ingridients }) {
  return (
    <div className="meal">
      <div className="inforamation">
        {Name}
        {"Macro Nutrients"}
        {"Ingredients"}
        {""}
      </div>
    </div>
  );
}

export default Meal;
