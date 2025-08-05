import { Link } from "react-router-dom";
import "./Home.css";
import logo from "./logo.png";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="left-section">
          <img src={logo} alt="SmartBudget Logo" className="logo" />
          <span className="slogan">Your Money, Organized.</span>
        </div>
        <div className="auth-links">
          <Link to="/signup" className="btn btn-signup">Sign up</Link>
          <Link to="/login" className="btn btn-login">Log in</Link>
        </div>
      </header>

      <main className="home-main">
        <div className="menu-box">
          <Link to="/dashboard" className="menu-button">Dashboard</Link>
          <Link to="/stocks" className="menu-button">Stocks</Link>
          <Link to="/expenses" className="menu-button">Calculate Expenses</Link>
          <Link to="/forums" className="menu-button">Forums</Link>
        </div>
      </main>

      <footer className="home-footer">
        Footer here
      </footer>
    </div>
  );
}

export default Home;
