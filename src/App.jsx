import React from "react";
import { Router, Route, Routes, BrowserRouter } from "react-router-dom";
import Header from "./Components/Header";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import SearchPage from "./Pages/SearchPage";
import CreateMealPage from "./Pages/CreateMealPage";
import AdjustGoalsPage from "./Pages/AdjustGoalsPage";
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
              </>
            }
          />
          <Route
            path="/search"
            element={
              <>
                <Header />
                <SearchPage />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Header />
                <LoginPage />
              </>
            }
          />
          <Route
            path="/createMeal"
            element={
              <>
                <Header />
                <CreateMealPage />
              </>
            }
          />
          <Route
            path="/adjustGoals"
            element={
              <>
                <Header />
                <AdjustGoalsPage />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
