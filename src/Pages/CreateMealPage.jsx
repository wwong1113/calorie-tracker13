import React, { useState, useContext } from "react";
import Meal from "../Components/Meal";

function CreateMealPage() {
  const [food, setFood] = useState("");

  const handleSubmit = () => {
    console.log(food);
  };
  return (
    <div>
      <form>
        <input
          type="text"
          value={food}
          placeholder="Search for foods"
          onSubmit={handleSubmit}
          onChange={(event) => setFood(event.target.value)}
        ></input>
        <label>Enter Meal Name</label>
        <input type="text" placeholder="Example Meal"></input>
        <button type="Submit">Submit</button>
      </form>
      <div className="listOfMeals">
        <h2>List Of Meals</h2>
        <Meal></Meal>
        <div>Map of Meals</div>
      </div>
    </div>
  );
}

export default CreateMealPage;
