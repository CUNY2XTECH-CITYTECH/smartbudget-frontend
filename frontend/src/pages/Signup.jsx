import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css"; // make sure this file exists and is correctly named

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // optional if not needed in backend
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // important for cookies/session
        body: JSON.stringify({
          name: username,
          password: password
          // include email if backend supports it
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="signup-container">
      <h1 className="signup-header">Sign Up</h1>
      <form className="signup-card" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {/* Optional email field */}
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="continue-btn" type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default Signup;
