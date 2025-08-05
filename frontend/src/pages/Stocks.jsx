import { useState, useEffect } from 'react';
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
  const [form, setForm] = useState({
    ticker: '',
    period: '1mo',
    interval: '1d',
  });

  const [query, setQuery] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.ticker.trim()) {
      const formattedQuery = {
        ...form,
        ticker: form.ticker.trim().toUpperCase(),
      };
      setQuery(formattedQuery);
    }
  };

  useEffect(() => {
    if (!query) return;

    const { ticker, period, interval } = query;

    fetch(`http://localhost:5000/api/stock/${ticker}?period=${period}&interval=${interval}`)
    .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setChartData(null);
          setStats(null);
        } else {
          const labels = data.history.map((point) => point.date);
          const prices = data.history.map((point) => point.close);

          setChartData({
            labels,
            datasets: [
              {
                label: `${data.ticker} Closing Price`,
                data: prices,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.3,
              },
            ],
          });

          setStats(data.stats);
          setError(null);
        }
      })
      .catch((err) => {
        setError("Network error. Please try again later.");
        console.error(err);
      });
  }, [query]);

  return (
    <div className="stocks-page">
      <h2>Stock Market Viewer</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="ticker"
          placeholder="e.g. AAPL"
          value={form.ticker}
          onChange={handleChange}
          required
        />
        <select name="period" value={form.period} onChange={handleChange}>
          <option value="5d">5 Days</option>
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
        </select>
        <select name="interval" value={form.interval} onChange={handleChange}>
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
