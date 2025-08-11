// src/components/SidebarShell.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarShell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="page-with-sidebar">
      {/* Top-left transparent hamburger */}
      <button
        className="page-hamburger"
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>

      {/* Sidebar drawer */}
      <aside className={`page-sidebar-wrap ${open ? "show" : ""}`}>
        <nav className="dashboard-sidebar">
          <div className="sidebar-buttons">
            <Link to="/dashboard" className={`sidebar-btn ${isActive("/dashboard") ? "active" : ""}`}>Dashboard</Link>
            <Link to="/stocks" className={`sidebar-btn ${isActive("/stocks") ? "active" : ""}`}>Stocks</Link>
            <Link to="/expenses" className={`sidebar-btn ${isActive("/expenses") ? "active" : ""}`}>Calculate Expenses</Link>
            <Link to="/forums" className={`sidebar-btn ${isActive("/forums") ? "active" : ""}`}>Forums</Link>
          </div>

          <div className="sidebar-settings">
            <Link to="/settings" className="sidebar-btn settings-btn">
              <span className="settings-icon">⚙️</span> Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Centered page content */}
      <main className="page-content">
        <div className="page-width">{children}</div>
      </main>
    </div>
  );
}
