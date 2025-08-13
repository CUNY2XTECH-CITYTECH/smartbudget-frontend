// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!alive) return;
        if (data?.loggedIn) setUsername(data.user || "");
        else setUsername("");
      })
      .catch(() => setUsername(""))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/delete", {
        method: "POST",             // <-- backend expects POST, not DELETE
        credentials: "include",
      });
      if (res.ok) {
        alert("Account deleted.");
        window.location.href = "/";
      } else {
        alert("Failed to delete account.");
      }
    } catch {
      alert("Error deleting account.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span role="img" aria-label="avatar" className="avatar-icon">👤</span>
        </div>
        <h2 className="profile-title">Settings</h2>
      </div>

      <div className="profile-info">
        <div className="profile-section">
          <label>Username:</label>
          {loading ? (
            <span>Loading…</span>
          ) : editing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="profile-input"
            />
          ) : (
            <span>{username || "Guest"}</span>
          )}
        </div>

        <div className="profile-section">
          <label>Password:</label>
          <button className="profile-btn">Change Password</button>
        </div>

        <div className="profile-section">
          <label>Settings:</label>
          <button className="profile-btn" onClick={handleDelete}>
            DELETE ACCOUNT
          </button>
        </div>
      </div>

      <div className="profile-actions">
        <button className="profile-btn" onClick={() => setEditing(!editing)}>
          {editing ? "Save" : "Edit Profile"}
        </button>
        <button className="profile-btn logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
