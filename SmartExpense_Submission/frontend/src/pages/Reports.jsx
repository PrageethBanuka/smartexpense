import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function monthString(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function getPastMonths(count = 6) {
  const arr = [];
  const d = new Date();
  d.setUTCDate(1);
  for (let i = 0; i < count; i++) {
    const clone = new Date(d); // clone base date
    clone.setUTCMonth(d.getUTCMonth() - i);
    arr.push(clone.toISOString().slice(0, 7));
  }
  return arr.reverse();
}

export default function Reports() {
  const [month, setMonth] = useState(monthString());
  const [categorySummary, setCategorySummary] = useState(null);
  const [loadingCat, setLoadingCat] = useState(false);
  const [errorCat, setErrorCat] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [errorForecast, setErrorForecast] = useState('');
  const months = getPastMonths(6);

  useEffect(() => {
    async function fetchSummary() {
      setLoadingCat(true); setErrorCat('');
      try {
        const { data } = await api.get(`/expenses/summary/month?month=${month}`);
        setCategorySummary(data);
      } catch (e) {
        setErrorCat(e?.response?.data?.message || 'Failed to load summary');
      } finally { setLoadingCat(false); }
    }
    fetchSummary();
  }, [month]);

  useEffect(() => {
    async function fetchForecast() {
      setLoadingForecast(true); setErrorForecast('');
      try {
        const results = [];
        for (const m of months) {
          // sequential fetch; acceptable for small number, could be parallel
          try {
            const { data } = await api.get(`/expenses/summary/month?month=${m}`);
            results.push({ month: m, total: data.total || 0 });
          } catch {
            results.push({ month: m, total: 0 });
          }
        }
        setForecastData(results);
      } catch (e) {
        console.error(e);
        setErrorForecast('Failed to load forecast');
      } finally { setLoadingForecast(false); }
    }
    fetchForecast();
  }, []);

  const pieData = categorySummary ? {
    labels: Object.keys(categorySummary.categories || {}),
    datasets: [
      {
        data: Object.values(categorySummary.categories || {}),
        backgroundColor: ['#38bdf8','#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6'],
      }
    ]
  } : null;

  const barData = {
    labels: forecastData.map(r => r.month),
    datasets: [
      {
        label: 'Total Spend',
        data: forecastData.map(r => r.total),
        backgroundColor: '#38bdf8'
      }
    ]
  };

  return (
    <div className="card">
      <h2>Reports</h2>
      <section>
        <h3 style={{ marginTop: 0 }}>Category Distribution (Pie)</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label htmlFor="month">Month:</label>
          <select id="month" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {loadingCat && <p>Loading…</p>}
        {errorCat && <p className="error">{errorCat}</p>}
        {!loadingCat && pieData && pieData.labels.length > 0 ? (
          <div style={{ maxWidth: 420, margin: '1rem auto' }}>
            <Pie data={pieData} />
          </div>
        ) : (!loadingCat && <p style={{ color: 'var(--muted)' }}>No data for selected month.</p>)}
      </section>
      <hr style={{ margin: '2rem 0', borderColor: '#1f2937' }} />
      <section>
        <h3 style={{ marginTop: 0 }}>Monthly Spend (Bar, last 6 months)</h3>
        {loadingForecast && <p>Loading…</p>}
        {errorForecast && <p className="error">{errorForecast}</p>}
        {!loadingForecast && forecastData.length > 0 ? (
          <div style={{ maxWidth: 600, margin: '1rem auto' }}>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        ) : (!loadingForecast && <p style={{ color: 'var(--muted)' }}>No forecast data.</p>)}
      </section>
    </div>
  );
}
