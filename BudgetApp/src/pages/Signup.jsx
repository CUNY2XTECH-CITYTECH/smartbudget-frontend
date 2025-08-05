import { useState } from "react";
import "./Login.css";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send data to an API)
    alert(`Sign Up - Username: ${username}, Email: ${email}, Password: ${password}`);
  };

  return (
    <div className="login-container">
      <header className="login-header">SmartBudget</header>

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
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <span>Already have an account? <a href="/login">Log in</a></span>
        </div>
      </div>

      <footer className="login-footer">Footer here</footer>
    </div>
  );
};

export default SignupPage;
