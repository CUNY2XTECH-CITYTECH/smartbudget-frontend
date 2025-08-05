import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './login.css';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include", // this passes the cookie
  body: JSON.stringify({ name: username, password: password })
});

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
