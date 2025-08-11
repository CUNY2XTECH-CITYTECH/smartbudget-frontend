import { Link } from "react-router-dom";
import "./Home.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-container">
      <Header />
      <main className="home-main">
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
