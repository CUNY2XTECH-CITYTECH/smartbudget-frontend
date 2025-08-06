import React, { useState } from "react";
import "./Login.css"; // Reusing your existing login styles
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful! Redirecting to login...");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong during signup.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">Create an Account</h2>

      <div className="login-card">
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="continue-btn">
            Sign Up
          </button>
        </form>
      </div>

      <div className="login-footer">Already have an account? Log in above!</div>
    </div>
  );
};

export default Signup;
