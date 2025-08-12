// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/session", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!alive) return;
        if (data?.loggedIn) setUser({ username: data.user });
        else setUser(null);
      })
      .catch(() => {})
      .finally(() => { if (alive) setChecking(false); });
    return () => { alive = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="left-section">
          <img src={logo} alt="SmartBudget Logo" className="logo" />
          <span className="slogan">Your Money, Organized.</span>
        </div>

        <div className="auth-links">
          {!checking && (
            user ? (
              <div className="user-box">
                <span className="user-name">👤 {user.username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/signup" className="btn btn-signup">Sign up</Link>
                <Link to="/login" className="btn btn-login">Log in</Link>
              </>
            )
          )}
        </div>
      </header>

      <main className="page-width home-main">
        <section className="hero">
          <h1>Take control of your money.</h1>
          <p>Track spending, budget smarter, and grow with simple insights.</p>
        </section>

        <div className="menu-box">
          <Link to="/dashboard" className="menu-button">Dashboard</Link>
          <Link to="/stocks" className="menu-button">Stocks</Link>
          <Link to="/expenses" className="menu-button">Calculate Expenses</Link>
          <Link to="/forums" className="menu-button">Forums</Link>
        </div>
      </main>

     <Footer />
    </div>
  );
}

export default Home;
