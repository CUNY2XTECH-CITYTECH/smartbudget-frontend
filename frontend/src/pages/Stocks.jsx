import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

function Stocks() {
  const [formData, setFormData] = useState({
    period: '1mo',
    interval: '1d',
    ticker: ''
  });

  const [query, setQuery] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setChartData(null);
    setStats(null);
    setQuery(null);

    try {
      const response = await fetch('http://localhost:5000/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unknown error occurred');
        return;
      }

      setQuery({ ticker: data.ticker });
      setStats(data.stats);

      // Prepare chart data
      setChartData({
        labels: data.history.map(item => item.date),
        datasets: [{
          label: `${data.ticker} Closing Prices`,
          data: data.history.map(item => item.close),
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1
        }]
      });

    } catch (err) {
      console.error(err);
      setError('Network error or backend not running');
    }
  };

  return (
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

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {chartData && (
        <>
          <Line data={chartData} />
          {stats && (
            <div>
              <h3>Statistics for {query.ticker}</h3>
              <ul>
                <li><strong>Latest:</strong> ${stats.latest}</li>
                <li><strong>Average:</strong> ${stats.average}</li>
                <li><strong>Min:</strong> ${stats.min}</li>
                <li><strong>Max:</strong> ${stats.max}</li>
                <li><strong>Standard Deviation:</strong> {stats.std_dev}</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Stocks;
