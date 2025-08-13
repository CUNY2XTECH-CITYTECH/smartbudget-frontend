// src/pages/Dashboard.jsx
import "./dashboard.css";
import logo from "./logo.png";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import MonthlyExpense from "./MonthlyExpense";

import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // header session state (dashboard-only)
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // charts
  const [monthlyPie, setMonthlyPie] = useState(null); // {labels, amounts}
  const [dayData, setDayData] = useState(null);       // {labels, amounts}

  // --- session check ---
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

  // --- charts loaders ---
  const loadMonthlyPie = async (opts) => {
    try {
      // if a specific month was just saved, use it; else load latest saved plan
      let url = "/api/monthly/pie/latest";
      if (opts?.year && opts?.month) {
        url = `/api/monthly/pie?year=${opts.year}&month=${opts.month}&metric=actual`;
      }
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error("pie fetch failed");
      const data = await r.json();
      setMonthlyPie(data);
    } catch (e) {
      console.error(e);
      setMonthlyPie({ labels: [], amounts: [] });
    }
  };

  const loadDaily = async () => {
    try {
      const r = await fetch("/api/expenses/daily-both", { credentials: "include" });
      if (!r.ok) throw new Error("daily fetch failed");
      setDayData(await r.json()); // {labels, expenses, income}
    } catch (e) {
      console.error(e);
      setDayData({ labels: [], expenses: [], income: [] });
    }
  };

  // load both on mount
  useEffect(() => {
    loadMonthlyPie();
    loadDaily();
  }, []);

  // pie options (keep legend left/compact; no color changes)
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "left",
        align: "center",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 6,
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { size: 11 },
        },
      },
      tooltip: { enabled: true },
    },
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
                    <path d="M12 8.5a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 8.5zm9.44 3.05-.98-.56c.04-.33.04-.66 0-.99l.98-.56a1 1 0 0 0 .37-1.37l-1-1.73a1 1 0 0 0-1.28-.44l-1.11.46a8 8 0 0 0-1.72-1l-.17-1.19A1 1 0 0 0 14.53 2h-2.06a1 1 0 0 0-.99.84l-.17 1.19a8 1 0 0 0-1.72 1l-1.11-.46a1 1 0 0 0-1.28.44l-1 1.73a1 1 0 0 0 .37 1.37l.98.56a7 7 0 0 0 0 .99l-.98.56a1 1 0 0 0-.37 1.37l1 1.73a1 1 0 0 0 1.28.44l1.11-.46c.53.41 1.11.75 1.72 1l.17 1.19a1 1 0 0 0 .99.84h2.06a1 1 0 0 0 .99-.84l.17-1.19c.61-.25 1.19-.59 1.72-1l1.11.46a1 1 0 0 0 1.28-.44l1-1.73a1 1 0 0 0-.37-1.37z" fill="currentColor"/>
                  </svg>
                  Settings
                </Link>
              </div>
            </aside>
          )}

          <div className="dashboard-content">
            <div className="content-grid">
              {/* Left: Monthly budget editor */}
              <div className="card main-chart">
                <div className="card-inner">
                  <div className="chart-title">Monthly Expenses</div>
                  <MonthlyExpense
                    onSaved={(ym) => {
                      // refresh both charts after save
                      loadMonthlyPie(ym);
                      loadDaily();
                    }}
                  />
                </div>
              </div>

              {/* Top-right: Monthly pie from saved plan */}
              <div className="card pie-chart">
                <div className="card-inner">
                  <div className="chart-title">Spending Breakdown</div>
                  {monthlyPie ? (
                    monthlyPie.labels?.length ? (
                      <Pie
                        data={{
                          labels: monthlyPie.labels,
                          datasets: [
                            {
                              data: monthlyPie.amounts,
                              backgroundColor: [
                                "#FF6384", "#36A2EB", "#FFCE56",
                                "#A1DE93", "#FFB6C1", "#8A2BE2",
                              ],
                            },
                          ],
                        }}
                        options={pieOptions}
                      />
                    ) : (
                      <div className="chart-placeholder">No data for this month.</div>
                    )
                  ) : (
                    <div className="chart-placeholder">Loading…</div>
                  )}
                </div>
              </div>

              {/* Bottom-right: Daily expenses line */}
              <div className="card line-chart">
                <div className="card-inner">
                  <div className="chart-title">Cash Flow Trend</div>
                  {dayData ? (
  <Line
    data={{
      labels: dayData.labels || [],
      datasets: [
        {
          label: "Daily Spending",
          data: dayData.expenses || [],
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.3,
        },
        {
          label: "Daily Income",
          data: dayData.income || [],
          fill: false,
          borderColor: "rgb(34, 197, 94)", // green line for income
          tension: 0.3,
        },
      ],
    }}
    options={{ responsive: true, maintainAspectRatio: false }}
  />
) : (
  <div className="chart-placeholder">Loading…</div>
)}

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
