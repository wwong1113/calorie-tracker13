import React from "react";
import "../CSS/Header.css";
import { useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();
  const handleSubmit = (path) => {
    navigate(path);
  };
  return (
    <div className="header">
      <div className="logo">Logo</div>
      <div className="center">
        <div className="Home" onClick={() => handleSubmit("/")}>
          Home
        </div>
        <div className="search_foods" onClick={() => handleSubmit("/search")}>
          Search
        </div>
      </div>

      <div className="login" onClick={() => handleSubmit("/login")}>
        Login/SignUp
      </div>
    </div>
  );
}

export default Header;
