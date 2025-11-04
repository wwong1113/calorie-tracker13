import React from "react";
import "../CSS/Header.css";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const handleSubmit = (path) => {
    navigate(path);
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => handleSubmit("/")}>
        <div className="logo">FitTrack</div>
      </div>

      <nav className="header-center">
        <div className="nav-item" onClick={() => handleSubmit("/")}>
          Home
        </div>
        <div className="nav-item" onClick={() => handleSubmit("/search")}>
          Search
        </div>
        <div className="nav-item" onClick={() => handleSubmit("/createMeal")}>
          Create Meal
        </div>
      </nav>

      <div className="header-right">
        <button className="login-btn" onClick={() => handleSubmit("/login")}>
          Login / Sign Up
        </button>
      </div>
    </header>
  );
}

export default Header;
