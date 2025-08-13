import { useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [username, setUsername] = useState("User123");
  const [email, setEmail] = useState("user@example.com");
  const [editing, setEditing] = useState(false);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span role="img" aria-label="avatar" className="avatar-icon">
            👤
          </span>
        </div>
        <h2 className="profile-title">Setting</h2>
      </div>
      <div className="profile-info">
        <div className="profile-section">
          <label>Username:</label>
          {editing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="profile-input"
            />
          ) : (
            <span>{username}</span>
          )}
        </div>
        <div className="profile-section">
          <label>Password:</label>
          <button className="profile-btn">Change Password</button>
        </div>
        <div className="profile-section">
          <label>Settings:</label>
          <button
            className="profile-btn"
            onClick={async () => {
              if (
                window.confirm(
                  "Are you sure you want to delete your account? This cannot be undone."
                )
              ) {
                try {
                  const response = await fetch("/api/delete-account", {
                    method: "DELETE",
                    credentials: "include",
                  });
                  if (response.ok) {
                    alert("Account deleted.");
                    // Optionally redirect to login or home
                    window.location.href = "/login";
                  } else {
                    alert("Failed to delete account.");
                  }
                } catch (err) {
                  alert("Error deleting account.");
                }
              }
            }}
          >
            DELETE ACCOUNT
          </button>{" "}
        </div>
      </div>
      <div className="profile-actions">
        <button className="profile-btn" onClick={() => setEditing(!editing)}>
          {editing ? "Save" : "Edit Profile"}
        </button>
        <button
          className="profile-btn logout"
          onClick={async () => {
            try {
              const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
              });
              // Redirect to login page regardless of response
              window.location.href = "/";
            } catch (err) {
              window.location.href = "/";
            }
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
