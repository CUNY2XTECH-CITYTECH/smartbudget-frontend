// src/pages/Expenses.jsx
import React, { useState, useEffect } from "react";
import "./Expenses.css";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import SidebarShell from "../components/SidebarShell.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

// ✅ One axios client for this page (points to Flask)
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export default function Expenses() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
  });

  const [file, setFile] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [message, setMessage] = useState("");

  const fetchCharts = async () => {
    try {
      const [categoryRes, dailyRes] = await Promise.all([
        api.get("/expenses/chart-data"),
        api.get("/expenses/daily"),
      ]);
      setCategoryData(categoryRes.data);
      setDailyData(dailyRes.data);
    } catch (err) {
      console.error("Error fetching charts:", err);
      setMessage("Failed to fetch charts");
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", formData);
      setFormData({ description: "", amount: "", category: "", date: "" });
      setMessage("Expense added!");
      fetchCharts();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add expense");
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const up = new FormData();
    up.append("file", file);

    try {
      await api.post("/upload", up, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setMessage("CSV uploaded successfully!");
      fetchCharts();
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload CSV");
    }
  };

  return (
    <SidebarShell>
      <div className="expenses-container">
        <div className="expenses-inner">
          <h1 className="expenses-title">📊 Expense Tracker Dashboard</h1>

          {message && (
            <p
              className={`expenses-msg${
                message.toLowerCase().includes("fail") ? " error" : ""
              }`}
            >
              {message}
            </p>
          )}

          <div className="exp-card">
            <h3>Add Expense Manually</h3>
            <form onSubmit={handleExpenseSubmit} className="exp-form">
              <input
                className="exp-input"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <input
                className="exp-input"
                name="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <input
                className="exp-input"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
              <input
                className="exp-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className="exp-btn">Add</button>
            </form>
          </div>

          <div className="exp-card">
            <h3>Upload CSV</h3>
            <form onSubmit={handleCsvUpload} className="exp-form">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="exp-file"
              />
              <button type="submit" className="exp-btn">Upload</button>
            </form>
          </div>

          <div className="exp-charts">
            {categoryData && (
              <div className="chart-card pie">
                <h3>Expenses by Category</h3>
                <Pie
                  data={{
                    labels: categoryData.labels,
                    datasets: [
                      {
                        data: categoryData.amounts,
                        backgroundColor: [
                          "#FF6384",
                          "#36A2EB",
                          "#FFCE56",
                          "#A1DE93",
                          "#FFB6C1",
                          "#8A2BE2",
                        ],
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            )}

            {dailyData && (
              <div className="chart-card line">
                <h3>Daily Expenses</h3>
                <Line
                  data={{
                    labels: dailyData.labels,
                    datasets: [
                      {
                        label: "Daily Spending",
                        data: dailyData.amounts,
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarShell>
  );
}
