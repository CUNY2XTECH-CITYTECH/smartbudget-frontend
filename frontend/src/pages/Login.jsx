import { useState } from "react";
import "./Login.css";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace this with your login logic
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  return (
    <div className="login-container">
      <header className="login-header">SmartBudget</header>
      <div className="login-tabs">
        <button className="tab signup">Sign up</button>
        <button className="tab login active">Log in</button>
      </div>
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Email Address</label>
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
          <button type="submit" className="continue-btn">Login</button>
        </form>
        <div className="guest-link">
          <span>Continue as Guest</span>
          </div>
      </div>
      <footer className="login-footer">Footer here</footer>
    </div>
  );
}

export default Login;