// src/pages/Forums.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Forums.css";
import ThreadCard from "./ThreadCard.jsx";
import SidebarShell from "../components/SidebarShell.jsx";

function Forums() {
  const [threads, setThreads] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", body: "" });
  const [banner, setBanner] = useState("");        // <-- for "please log in" message
  const [loggedIn, setLoggedIn] = useState(false); // <-- session status

  // Check session once
  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setLoggedIn(!!d?.loggedIn))
      .catch(() => setLoggedIn(false));
  }, []);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState(null);

  // Fetch threads
  useEffect(() => {
    fetch("/api/threads", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load threads (${res.status})`);
        return res.json();
      })
      .then((data) =>
        setThreads(
          data.map((t) => ({
            id: t.threadID,
            title: t.title,
            author: `User ${t.userID}`,
            time: new Date(t.timestamp).toLocaleString(),
            body: t.content,
          }))
        )
      )
      .catch((err) => console.error("Load threads error:", err));
  }, []);

  // Fetch user session
  useEffect(() => {
    fetch("/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) setUser({ username: data.user });
        else setUser(null);
      });
  }, []);

  // Fetch comments for selected thread
  useEffect(() => {
    if (!selectedThread) return;
    fetch(
      `http://localhost:5000/api/threads/${selectedThread.id}/comments`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setComments([]));
  }, [selectedThread]);

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(search.toLowerCase())
  );

  const openForm = async () => {
    // Gate the form by session; show friendly banner if not logged in
    const res = await fetch("/api/session", { credentials: "include" });
    const d = res.ok ? await res.json() : { loggedIn: false };
    if (!d.loggedIn) {
      setBanner("Please log in to post a thread.");
      setShowForm(false);
      return;
    }
    setBanner("");
    setShowForm(true);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.body.trim()) return;

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newThread.title,
          body: newThread.body,
        }),
      });

      // Friendly 401 message
      let payload = {};
      try { payload = await res.json(); } catch {}

      if (res.status === 401) {
        setBanner("Please log in to post a thread.");
        setShowForm(false);
        return;
      }
      if (!res.ok) {
        throw new Error(payload.error || `Request failed (${res.status})`);
      }

      const data = payload;
      const added = {
        id: data.threadID,
        title: data.title,
        author: `User ${data.userID}`,
        time: new Date(data.timestamp).toLocaleString(),
        body: data.content,
      };
      setThreads((prev) => [added, ...prev]);
      setShowForm(false);
      setNewThread({ title: "", body: "" });
      setBanner(""); // clear any old banner
    } catch (err) {
      console.error("Thread creation error:", err);
      setBanner(err.message || "Failed to post thread.");
    }
  };

  // Handle posting a comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedThread) return;
    const res = await fetch(
      `http://localhost:5000/api/threads/${selectedThread.id}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: commentText }),
      }
    );
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } else {
      alert("You must be signed in to post.");
    }
  };

  return (
    <SidebarShell>
      <div className="forums-container">
        {/* Friendly banner */}
        {banner && (
          <div className="forum-banner">
            {banner}{" "}
            {!loggedIn && (
              <>
                <Link to="/login">Log in</Link> or{" "}
                <Link to="/signup">Sign up</Link>
              </>
            )}
          </div>
        )}

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
          {filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              {...thread}
              onClick={() => setSelectedThread(thread)}
            />
          ))}
        </div>

        <button className="floating-plus" onClick={openForm}>
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
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conversation sidebar */}
        {selectedThread && (
          <div className="conversation-sidebar">
            <button className="close-x" onClick={() => setSelectedThread(null)} aria-label="Close">&times;</button>
            <div className="thread-details">
              <h3>{selectedThread.title}</h3>
              <p>
                <strong>{selectedThread.author}</strong> •{" "}
                {selectedThread.time}
              </p>
              <p>{selectedThread.body}</p>
              <h4>Conversation</h4>
              <div className="comments-list">
                {comments.map((c, i) => (
                  <div key={i} className="comment">
                    <strong>{c.author}</strong>: {c.text}
                  </div>
                ))}
              </div>
              {user ? (
                <form onSubmit={handlePostComment} className="comment-form">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                  <button type="submit">Post</button>
                </form>
              ) : (
                <div className="login-to-comment">
                  <span>Sign in to add to the conversation.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarShell>
  );
}

export default Forums;
