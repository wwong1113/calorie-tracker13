import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Header from "./Components/Header";
import { ToastProvider } from "./Components/Toast";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import SearchPage from "./Pages/SearchPage";
import CreateMealPage from "./Pages/CreateMealPage";
import AdjustGoalsPage from "./Pages/AdjustGoalsPage";
import { useStateValue } from "./StateProvider";

function App() {
  const [{ ready }] = useStateValue();

  return (
    // reducedMotion="user" swaps movement for fades when the OS asks for it.
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <Header />
          {/* Wait until we know who is signed in, so guest data never flashes. */}
          {!ready ? (
            <main className="page" aria-busy="true" />
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* Tracking lives on Today; this route opens it with the add sheet up. */}
              <Route
                path="/trackCalories"
                element={<Navigate to="/" replace state={{ add: true }} />}
              />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/createMeal" element={<CreateMealPage />} />
              <Route path="/adjustGoals" element={<AdjustGoalsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
