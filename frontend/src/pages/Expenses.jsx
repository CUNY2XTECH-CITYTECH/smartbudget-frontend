// src/pages/Expenses.jsx
import React, { useState, useEffect } from "react";
import "./Expenses.css";
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

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    plugins: {
      legend: {
        position: "left",
        align: "center",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 6,
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: { size: 11 },
        },
      },
    },
    elements: { arc: { borderWidth: 1 } },
  };

  const fetchCharts = async () => {
    try {
      const [catRes, dayRes] = await Promise.all([
        fetch("/api/expenses/chart-data", { credentials: "include" }),
        fetch("/api/expenses/daily", { credentials: "include" }),
      ]);
      if (!catRes.ok || !dayRes.ok) throw new Error("chart fetch failed");
      const [catJson, dayJson] = await Promise.all([catRes.json(), dayRes.json()]);
      setCategoryData(catJson);
      setDailyData(dayJson);
    } catch (err) {
      console.error("Error fetching charts:", err);
      setMessage("Failed to fetch charts. Please Log in!");
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
      const res = await fetch("/api/expenses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // backend casts amount/date
      });
      if (!res.ok) throw new Error("add failed");
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
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: up, // no headers; browser sets boundary
      });
      if (!res.ok) throw new Error("upload failed");
      setFile(null);
      setMessage("CSV uploaded successfully!");
      fetchCharts();
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload CSV. Please Log in!");
    }
  };

  return (
    <SidebarShell>
      <div className="expenses-container">
        <div className="expenses-inner">
          <h1 className="expenses-title">📊 Expense Tracker Dashboard</h1>

          {message && (
            <p className={`expenses-msg${message.toLowerCase().includes("fail") ? " error" : ""}`}>
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
                <div className="pie-wrap">
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
                    options={pieOptions}
                  />
                </div>
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
