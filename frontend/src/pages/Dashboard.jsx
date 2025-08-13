// src/pages/Dashboard.jsx
import "./dashboard.css";
import logo from "./logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import MonthlyExpense from "./MonthlyExpense";
import Expenses from "./Expenses";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // session state for header (dashboard-only)
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!alive) return;
        if (data?.loggedIn) setUser({ username: data.user });
        else setUser(null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="home-header dashboard-header">
        <div className="left-section">
          <button
            className="hamburger"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <img src={logo} alt="SmartBudget Logo" className="logo" />
          <span className="slogan">Your Money, Organized.</span>
        </div>

        <div className="auth-links">
          {!checking && (
            user ? (
              <div className="user-box">
                <span className="user-name">👤 {user.username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/signup" className="btn btn-signup">Sign up</Link>
                <Link to="/login" className="btn btn-login">Log in</Link>
              </>
            )
          )}
        </div>
      </header>

      <div className="dashboard-main">
        <div className="dashboard-layout">
          {sidebarOpen && (
            <aside className="dashboard-sidebar">
              <div className="sidebar-buttons">
                <Link to="/dashboard" className={`sidebar-btn ${isActive("/dashboard") ? "active" : ""}`}>Dashboard</Link>
                <Link to="/stocks" className={`sidebar-btn ${isActive("/stocks") ? "active" : ""}`}>Stocks</Link>
                <Link to="/expenses" className={`sidebar-btn ${isActive("/expenses") ? "active" : ""}`}>Calculate Expenses</Link>
                <Link to="/forums" className={`sidebar-btn ${isActive("/forums") ? "active" : ""}`}>Forums</Link>
              </div>

              <div className="sidebar-settings">
                <Link to="/settings" className="sidebar-btn settings-btn">
                  <svg className="settings-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 8.5a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 8.5zm9.44 3.05-.98-.56c.04-.33.04-.66 0-.99l.98-.56a1 1 0 0 0 .37-1.37l-1-1.73a1 1 0 0 0-1.28-.44l-1.11.46a8 8 0 0 0-1.72-1l-.17-1.19A1 1 0 0 0 14.53 2h-2.06a1 1 0 0 0-.99.84l-.17 1.19a8 8 0 0 0-1.72 1l-1.11-.46a1 1 0 0 0-1.28.44l-1 1.73a1 1 0 0 0 .37 1.37l.98.56a7 7 0 0 0 0 .99l-.98.56a1 1 0 0 0-.37 1.37l1 1.73a1 1 0 0 0 1.28.44l1.11-.46c.53.41 1.11.75 1.72 1l.17 1.19a1 1 0 0 0 .99.84h2.06a1 1 0 0 0 .99-.84l.17-1.19c.61-.25 1.19-.59 1.72-1l1.11.46a1 1 0 0 0 1.28-.44l1-1.73a1 1 0 0 0-.37-1.37z" fill="currentColor"/>
                  </svg>
                  Settings
                </Link>
              </div>
            </aside>
          )}

          <div className="dashboard-content">
            <div className="content-grid">
              <div className="card main-chart">
                <div className="card-inner">
                  <div className="chart-title">Monthly Expenses</div>
                  <MonthlyExpense />
                </div>
              </div>

              <div className="card pie-chart">
                <div className="card-inner">
                  <div className="chart-title">Spending Breakdown</div>
                  <div className="chart-placeholder">Pie Chart (placeholder)</div>
                </div>
              </div>

              <div className="card line-chart">
                <div className="card-inner">
                  <div className="chart-title">Cash Flow Trend</div>
                  <div className="chart-placeholder">Line Graph (placeholder)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-avatar">Avatar</div>
    </div>
  );
};

export default Dashboard;
