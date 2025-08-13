// ThreadCard.jsx
import './ThreadCard.css';

function ThreadCard({ title, author, time, onClick }) {
  return (
    <div className="thread-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <h3>{title}</h3>
      <p><strong>{author}</strong> • {time}</p>
      <button className="view-button" onClick={onClick}>View Thread</button>
    </div>
  );
}

export default ThreadCard;
