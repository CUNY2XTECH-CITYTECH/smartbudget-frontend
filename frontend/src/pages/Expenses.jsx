import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Tooltip, Legend
);

const Expenses = () => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });

  const [file, setFile] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch chart data
  const fetchCharts = async () => {
    try {
      const [categoryRes, dailyRes] = await Promise.all([
        axios.get('/expenses/chart-data'),
        axios.get('/expenses/daily')
      ]);
      setCategoryData(categoryRes.data);
      setDailyData(dailyRes.data);
    } catch (err) {
      console.error('Error fetching charts:', err);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  // Handle manual expense input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/expenses', formData);
      setFormData({ description: '', amount: '', category: '', date: '' });
      setMessage("Expense added!");
      fetchCharts();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add expense");
    }
  };

  // Handle CSV Upload
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload', formData);
      setFile(null);
      setMessage("CSV uploaded successfully!");
      fetchCharts();
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload CSV");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>📊 Expense Tracker Dashboard</h1>

      {/* Message */}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Form to add expense */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Add Expense Manually</h3>
        <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required />
          <input name="amount" type="number" placeholder="Amount" value={formData.amount} onChange={handleInputChange} required />
          <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
          <input name="date" type="date" value={formData.date} onChange={handleInputChange} required />
          <button type="submit">Add</button>
        </form>
      </div>

      {/* CSV Upload */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload CSV</h3>
        <form onSubmit={handleCsvUpload}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
          <button type="submit" style={{ marginLeft: '1rem' }}>Upload</button>
        </form>
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {categoryData && (
          <div style={{ width: '400px' }}>
            <h3>Expenses by Category</h3>
            <Pie
              data={{
                labels: categoryData.labels,
                datasets: [{
                  data: categoryData.amounts,
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#A1DE93', '#FFB6C1', '#8A2BE2'],
                }]
              }}
            />
          </div>
        )}

        {dailyData && (
          <div style={{ width: '500px' }}>
            <h3>Daily Expenses</h3>
            <Line
              data={{
                labels: dailyData.labels,
                datasets: [{
                  label: 'Daily Spending',
                  data: dailyData.amounts,
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.3
                }]
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;