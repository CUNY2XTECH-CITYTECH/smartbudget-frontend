// ThreadCard.jsx
import './ThreadCard.css';

function ThreadCard({ title, author, time }) {
  return (
    <div className="thread-card">
      <h3>{title}</h3>
      <p><strong>{author}</strong> • {time}</p>
      <button className="view-button">View Thread</button>
    </div>
  );
}

export default ThreadCard;
