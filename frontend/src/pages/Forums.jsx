// /pages/Forums.jsx
import React from "react";
import "./forums.css";
import Footer from "../components/Footer";
import ThreadCard from "./ThreadCard";

const dummyThreads = [
  {
    id: 1,
    title: "How do you budget groceries under $200?",
    author: "Talisha",
    createdAt: "2 hours ago"
  },
  {
    id: 2,
    title: "Best budgeting apps for college students?",
    author: "David",
    createdAt: "1 day ago"
  },
  {
    id: 3,
    title: "Saving tips for freelancers?",
    author: "Alex",
    createdAt: "3 days ago"
  }
];

const Forums = () => {
  return (
    <div>
    <div className="forums-container">
      <h1 className="forums-header">💬 Community Threads</h1>
      <div className="threads-grid">
        {dummyThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Forums;
