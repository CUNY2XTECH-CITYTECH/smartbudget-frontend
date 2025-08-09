import "./Signup.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: username, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }

      if (response.ok) {
        alert("Signup successful! You can now log in.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup.");
    }
  };

  return (
    <div className="login-container">
      {/* No title/header here by request */}

      {/* This wrapper centers the card while keeping footer at the bottom */}
      <main className="auth-main">
        <div className="login-card">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="continue-btn">Sign Up</button>
          </form>

          <div className="guest-link">
            <span>
              Already have an account? <Link to="/login">Log in</Link>
            </span>
          </div>
        </div>
      </main>

      <footer className="login-footer">Footer here</footer>
    </div>
  );
};

export default SignupPage;
