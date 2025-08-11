import { useState, useEffect } from 'react';
import './Forums.css';
import ThreadCard from './ThreadCard.jsx';

function Forums() {
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '' });

  // Fetch threads (include credentials only if your GET requires login)
  useEffect(() => {
    fetch('http://localhost:5000/api/threads', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load threads (${res.status})`);
        return res.json();
      })
      .then(data =>
        setThreads(
          data.map(t => ({
            id: t.threadID,
            title: t.title,
            author: `User ${t.userID}`,
            time: new Date(t.timestamp).toLocaleString(),
            body: t.content
          }))
        )
      )
      .catch(err => console.error('Load threads error:', err));
  }, []);

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.body.trim()) return;

    fetch('http://localhost:5000/api/threads', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',                 // 👈 send session cookie
        body: JSON.stringify({
          title: newThread.title,
          body: newThread.body
        })
      }
    )
      .then(async res => {
        let payload = {};
        try { payload = await res.json(); } catch {}
        if (!res.ok) throw new Error(payload.error || `Request failed (${res.status})`);
        return payload;
      })
      .then(data => {
        const added = {
          id: data.threadID,
          title: data.title,
          author: `User ${data.userID}`,
          time: new Date(data.timestamp).toLocaleString(),
          body: data.content
        };
        setThreads(prev => [added, ...prev]);  // functional update
        setShowForm(false);
        setNewThread({ title: '', body: '' });
      })
      .catch(err => {
        console.error('Thread creation error:', err);
        alert(err.message || 'Failed to post thread. Are you logged in?');
      });
  };

  return (
    <div className="main-layout">
      <div className="sidebar-placeholder" />
      <div className="forums-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <h2 className="forums-header">Community Threads</h2>

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
