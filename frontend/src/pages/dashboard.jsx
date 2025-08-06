import "./dashboard.css";

const Dashboard = () => (
  <div className="dashboard-container">
    <header className="dashboard-header">SmartBudget</header>
    <div className="dashboard-topbar">
      <button className="topbar-btn">Sign up</button>
      <button className="topbar-btn">Log in</button>
    </div>
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
          <button className="sidebar-btn active">Dashboard</button>
          <button className="sidebar-btn">Stocks</button>
          <button className="sidebar-btn">Calculate Expenses</button>
          <button className="sidebar-btn">Forums</button>
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
