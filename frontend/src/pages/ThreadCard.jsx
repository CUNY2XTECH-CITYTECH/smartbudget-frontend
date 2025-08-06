// /pages/ThreadCard.jsx
import React from "react";

const ThreadCard = ({ thread }) => {
  return (
    <div className="thread-card">
      <h3 className="thread-title">{thread.title}</h3>
      <p className="thread-meta">
        <strong>{thread.author}</strong> • {thread.createdAt}
      </p>
      <button className="view-btn">View Thread</button>
    </div>
  );
};

export default ThreadCard;
