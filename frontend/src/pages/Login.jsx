//login.jsx
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { search } = useLocation();
  const justSignedUp = new URLSearchParams(search).get("new") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // needed for session cookie
        body: JSON.stringify({ name: username, password }),
      });
  
      // Safely try to read JSON (405/HTML would crash otherwise)
      let data = {};
      try {
        data = await response.json();
      } catch (_) {}
  
      if (response.ok) {
        // logged in! c
        console.log("Logged in"+response.credentials);
        navigate("/");
      } else {
        alert((data && data.message) || `Login failed (status ${response.status})`);
      }
    } catch (err) {
      console.error("Error during login:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <main className="auth-main">
        <div className="login-card">
          <h2>Login</h2>

          {justSignedUp && (
            <div className="notice">
              Account created — you can log in now.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Log In</button>
          </form>

          <div className="switch-auth">
            <span>
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </span>
          </div>
        </div>
      </main>
       <footer class = "home-footer">
            © 2025 SmartBudget. All rights reserved. | 
            <a  className="contact"
            href="mailto:support@smartbudget.com">Contact Us</a>
        </footer>
    </div>
  );
}

export default Login;
