import "./dashboard.css";
import logo from "./logo.png";
import { Link } from "react-router-dom";

const Dashboard = () => (
  <div className="dashboard-container">
    <header className="home-header dashboard-header">
      <div className="left-section">
        <img src={logo} alt="SmartBudget Logo" className="logo" />
        <span className="slogan">Your Money, Organized.</span>
      </div>
      <div className="auth-links">
        <Link to="/signup" className="btn btn-signup">Sign up</Link>
        <Link to="/login" className="btn btn-login">Log in</Link>
      </div>
    </header>

    <div className="dashboard-main">
      <aside className="dashboard-sidebar">
        <nav>
          <ul>
            <li>Profile</li>
            <li>Reports</li>
            <li>Graphs</li>
          </ul>
        </nav>
        <div className="sidebar-buttons">
          <Link to="/dashboard" className="sidebar-btn active">Dashboard</Link>
          <Link to="/stocks" className="sidebar-btn">Stocks</Link>
          <Link to="/expenses" className="sidebar-btn">Calculate Expenses</Link>
          <Link to="/forums" className="sidebar-btn">Forums</Link>
        </div>
      </aside>
      <div className="dashboard-content">
        <div className="dashboard-row">
          <div className="dashboard-card"> Placeholder</div>
          <div className="dashboard-card">Placeholder</div>
        </div>
        <div className="dashboard-row">
          <div className="dashboard-card">Placeholder</div>
          <div className="dashboard-card">Placeholder</div>
        </div>
        <div className="dashboard-avatar">Avatar Placeholder</div>
      </div>
    </div>
  </div>
);
export default Dashboard;