// Forums.jsx
import { useState } from 'react';
import './Forums.css';
import ThreadCard from './ThreadCard.jsx';

const dummyThreads = [
  { id: 1, title: 'How do you budget groceries under $200?', author: 'Talisha', time: '2 hours ago' },
  { id: 2, title: 'Best budgeting apps for college students?', author: 'David', time: '1 day ago' },
  { id: 3, title: 'Saving tips for freelancers?', author: 'Alex', time: '3 days ago' },
];

function Forums() {
  const [threads, setThreads] = useState(dummyThreads);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '' });

  const filteredThreads = threads.filter(thread => thread.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.body.trim()) return;

    const newEntry = {
      id: Date.now(),
      title: newThread.title,
      author: 'You',
      time: 'Just now',
    };
    setThreads([newEntry, ...threads]);
    setShowForm(false);
    setNewThread({ title: '', body: '' });
  };

  return (
    <div className="main-layout">
      <div className="sidebar-placeholder">{/* Your nav component here */}</div>
  
      <div className="forums-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
  
        <h2 className="forums-header"> Community Threads</h2>
  
        <div className="thread-list">
          {filteredThreads.map(thread => (
            <ThreadCard key={thread.id} {...thread} />
          ))}
        </div>
  
        <button className="floating-plus" onClick={() => setShowForm(true)}>
  <span className="plus-icon">+</span>
</button>
  
        {showForm && (
          <div className="thread-popup">
            <form onSubmit={handleCreateThread} className="thread-form">
              <h3>Create a New Thread</h3>
              <input
                type="text"
                placeholder="Subject..."
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Post a question or thought..."
                value={newThread.body}
                onChange={(e) => setNewThread({ ...newThread, body: e.target.value })}
                required
              />
              <div className="popup-buttons">
                <button type="submit">Post</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default Forums;
