import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { search } = useLocation();
  const justSignedUp = new URLSearchParams(search).get("new") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookie
        body: JSON.stringify({ name: username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/");
      } else {
        alert(data.message || "Login failed");
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

      <footer className="login-footer">Footer here</footer>
    </div>
  );
};

export default Login;
