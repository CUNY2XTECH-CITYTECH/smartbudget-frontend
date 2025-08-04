import React, { useState } from 'react';

const Forums = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to the forum!', content: 'Introduce yourself here!' },
    { id: 2, title: 'Site Feedback', content: 'Let us know what you think.' },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handlePostSubmit = (e) => {
    e.preventDefault();

    if (newTitle.trim() && newContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        title: newTitle,
        content: newContent,
      };
      setPosts([newPost, ...posts]);
      setNewTitle('');
      setNewContent('');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Community Forums</h1>

      <form onSubmit={handlePostSubmit} style={{ marginBottom: '20px' }}>
        <h2>Create a New Post</h2>
        <div>
          <input
            type="text"
            placeholder="Post title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <div>
          <textarea
            placeholder="Post content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          ></textarea>
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Post
        </button>
      </form>

      <div>
        <h2>Latest Posts</h2>
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forums;

   // "name": "username", 
   // "email": "email",
   // "password": "password" } this is for json
