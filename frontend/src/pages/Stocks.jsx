// src/pages/Stocks.jsx
import "./Stocks.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import SidebarShell from "../components/SidebarShell.jsx"; // ⬅️ add this

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function Stocks() {
  const [formData, setFormData] = useState({
    period: "1mo",
    interval: "1d",
    ticker: "",
  });

  const [query, setQuery] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setChartData(null);
    setStats(null);
    setQuery(null);

    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unknown error occurred");
        return;
      }

      setQuery({ ticker: data.ticker });
      setStats(data.stats);

      setChartData({
        labels: data.history.map((item) => item.date),
        datasets: [
          {
            label: `${data.ticker} Closing Prices`,
            data: data.history.map((item) => item.close),
            fill: false,
            borderColor: "rgba(75,192,192,1)",
            tension: 0.1,
          },
        ],
      });
    } catch (err) {
      console.error(err);
      setError("Network error or backend not running");
    }
  };

  return (
    <SidebarShell>
      <div className="stocks-page">
        <h2>Stock Market Viewer</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="ticker"
            placeholder="e.g. AAPL"
            value={formData.ticker}
            onChange={handleChange}
            required
          />
          <select name="period" value={formData.period} onChange={handleChange}>
            <option value="5d">5 Days</option>
            <option value="1mo">1 Month</option>
            <option value="3mo">3 Months</option>
            <option value="6mo">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
          <select name="interval" value={formData.interval} onChange={handleChange}>
            <option value="1d">1 Day</option>
            <option value="1wk">1 Week</option>
            <option value="1mo">1 Month</option>
          </select>
          <button type="submit">Get Stock Data</button>
        </form>

        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        <div className="stocks-layout">
          {/* LEFT COLUMN */}
          <div>
            <div className="card chart-card">
              <div className="chart-box">
                {chartData ? (
                  <Line data={chartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      height: "100%",
                      color: "#4a5759",
                      fontWeight: 600,
                    }}
                  >
                    Chart will appear here
                  </div>
                )}
              </div>
            </div>

            {stats && (
              <div className="card" style={{ marginTop: 16 }}>
                <h3>Statistics for {query?.ticker}</h3>

                {/* Full-width stats grid */}
                <div className="stats-box">
                  <div className="stat-item">
                    <div className="stat-label">Latest</div>
                    <div className="stat-value">${stats.latest}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Average</div>
                    <div className="stat-value">${stats.average}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Min</div>
                    <div className="stat-value">${stats.min}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Max</div>
                    <div className="stat-value">${stats.max}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Std Dev</div>
                    <div className="stat-value">{stats.std_dev}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — NEWS PLACEHOLDER */}
          <div className="card news-card">
            <h3>Latest Stock News</h3>
            <div className="news-item">
              <div className="headline">Headline placeholder #1</div>
              <div className="meta">Source • Time</div>
            </div>
            <div className="news-item">
              <div className="headline">Headline placeholder #2</div>
              <div className="meta">Source • Time</div>
            </div>
            <div className="news-item">
              <div className="headline">Headline placeholder #3</div>
              <div className="meta">Source • Time</div>
            </div>
          </div>
        </div>
      </div>
    </SidebarShell>
  );
}
