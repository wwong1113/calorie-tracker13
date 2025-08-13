import React from "react";
import "../CSS/LoginPage.css";
import { useNavigate } from "react-router-dom";
function LoginPage() {
  return (
    <div className="login-container">
      <div className="input-container">
        <form>
          <label>Enter your email</label>
          <input type="text" placeholder="ex12345@gmail.com"></input>
          <label>Enter your password</label>
          <input type="password"></input>
          <button>Sign in</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
