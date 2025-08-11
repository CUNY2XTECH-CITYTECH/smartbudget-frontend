import { useState, useEffect } from 'react';
import './Forums.css';
import ThreadCard from './ThreadCard.jsx';
import Footer from "../components/Footer"; 

function Forums() {
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '' });

  // Fetch threads from backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/threads')
      .then(res => res.json())
      .then(data => setThreads(
        data.map(t => ({
          id: t.threadID,
          title: t.title,
          author: `User ${t.userID}`,
          time: new Date(t.timestamp).toLocaleString(),
          body: t.content
        }))
      ))
      .catch(console.error);
  }, []);

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.body.trim()) return;
    console.log("Posting new thread:", newThread);

    fetch('http://localhost:5000/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userID: 1,
          title: newThread.title,
          body: newThread.body
        })
      })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        console.log("Received from backend:", data);

        return res.json();
      })
      .then(data => {
        const added = {
          id: data.threadID,
          title: data.title,
          author: `User ${data.userID}`,
          time: new Date(data.timestamp).toLocaleString(),
          body: data.content
        };
        setThreads([added, ...threads]);
        setShowForm(false);
        setNewThread({ title: '', body: '' });
      })
      .catch(err => {
        console.error("Thread creation error:", err);
        alert("Failed to post thread. Please try again.");
      });
      
  };
 return (
    <div className="main-layout">
      <div className="sidebar-placeholder">{/* nav */}</div>
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
            <ThreadCard key={thread.id} thread={thread} />
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
                onChange={(e) =>
                  setNewThread({ ...newThread, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Post a question or thought..."
                value={newThread.body}
                onChange={(e) =>
                  setNewThread({ ...newThread, body: e.target.value })
                }
                required
              />
              <div className="popup-buttons">
                <button type="submit">Post</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )} 
        <Footer />
         </div>
    </div>
  );
}

export default Forums;
