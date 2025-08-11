import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open }) {
  const { pathname } = useLocation();
  const isActive = (p) => pathname === p;

  return (
    <aside className={`dashboard-sidebar ${open ? "open" : "collapsed"}`}>
      <nav className="sidebar-buttons">
        <Link to="/dashboard" className={`sidebar-btn ${isActive("/dashboard") ? "active" : ""}`}>Dashboard</Link>
        <Link to="/stocks" className={`sidebar-btn ${isActive("/stocks") ? "active" : ""}`}>Stocks</Link>
        <Link to="/expenses" className={`sidebar-btn ${isActive("/expenses") ? "active" : ""}`}>Calculate Expenses</Link>
        <Link to="/forums" className={`sidebar-btn ${isActive("/forums") ? "active" : ""}`}>Forums</Link>
      </nav>

      <div className="sidebar-settings">
        <Link to="/settings" className="sidebar-btn settings-btn">
          <span className="settings-icon">⚙️</span> Settings
        </Link>
      </div>
    </aside>
  );
}
