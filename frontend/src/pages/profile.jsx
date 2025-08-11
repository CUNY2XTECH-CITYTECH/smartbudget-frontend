// import { useState } from "react";
// import "./profile.css";

// const Profile = () => {
//   const [username, setUsername] = useState("User123");
//   const [email, setEmail] = useState("user@example.com");
//   const [editing, setEditing] = useState(false);

//   return (
//     <div className="profile-container">
//       <h2 className="profile-title">Profile</h2>
//       <div className="profile-section">
//         <label>Username:</label>
//         {editing ? (
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="profile-input"
//           />
//         ) : (
//           <span>{username}</span>
//         )}
//       </div>
//       <div className="profile-section">
//         <label>Email:</label>
//         {editing ? (
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="profile-input"
//           />
//         ) : (
//           <span>{email}</span>
//         )}
//       </div>
//       <div className="profile-section">
//         <label>Password:</label>
//         <button className="profile-btn">Change Password</button>
//       </div>
//       <div className="profile-section">
//         <label>Settings:</label>
//         <button className="profile-btn">Notification Settings</button>
//         <button className="profile-btn">Privacy Settings</button>
//       </div>
//       <div className="profile-actions">
//         <button className="profile-btn" onClick={() => setEditing(!editing)}>
//           {editing ? "Save" : "Edit Profile"}
//         </button>
//         <button className="profile-btn logout">Log Out</button>
//       </div>
//     </div>
//   );
// };

// export default Profile;


import { useState } from "react";
import "./profile.css";

const Profile = () => {
  const [username, setUsername] = useState("User123");
  const [email, setEmail] = useState("user@example.com");
  const [editing, setEditing] = useState(false);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span role="img" aria-label="avatar" className="avatar-icon">👤</span>
        </div>
        <h2 className="profile-title">Profile</h2>
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
        {/* <div className="profile-section">
          <label>Email:</label>
          {editing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="profile-input"
            />
          ) : (
            <span>{email}</span>
          )}
        </div> */}
        <div className="profile-section">
          <label>Password:</label>
          <button className="profile-btn">Change Password</button>
        </div>
        <div className="profile-section">
          <label>Settings:</label>
          <button className="profile-btn">Notification Settings</button>
          <button className="profile-btn">Privacy Settings</button>
        </div>
      </div>
      <div className="profile-actions">
        <button className="profile-btn" onClick={() => setEditing(!editing)}>
          {editing ? "Save" : "Edit Profile"}
        </button>
        <button className="profile-btn logout">Log Out</button>
      </div>
    </div>
  );
};

export default Profile;
