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
    <div className="card card-wide">
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>📈 Reports & Analytics</h2>
      <p style={{ color: 'var(--fg-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
        Visualize your spending patterns and track financial trends over time.
      </p>

      {/* Category Distribution Section */}
      <section style={{ 
        background: 'var(--glass-bg)', 
        padding: '2rem', 
        borderRadius: '12px',
        border: '1px solid var(--card-border)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            🎯 Category Distribution
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label htmlFor="month" style={{ margin: 0, fontSize: '0.95rem', color: 'var(--fg-muted)' }}>
              Select Month:
            </label>
            <select 
              id="month" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {loadingCat && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Loading category data...
          </div>
        )}
        {errorCat && <p className="error">{errorCat}</p>}
        {!loadingCat && pieData && pieData.labels.length > 0 ? (
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '1.5rem' }}>
            <Pie 
              data={pieData} 
              options={{ 
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    labels: { 
                      color: '#e2e8f0', 
                      font: { size: 13 },
                      padding: 15
                    } 
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.label || '';
                        if (label) {
                          label += ': $';
                        }
                        if (context.parsed !== null) {
                          label += context.parsed.toFixed(2);
                        }
                        return label;
                      }
                    }
                  }
                }
              }} 
            />
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginBottom: '0.25rem' }}>
                Total Spending
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-light)' }}>
                ${categorySummary?.total?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        ) : (!loadingCat && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
            <p style={{ margin: 0, fontSize: '1.05rem' }}>No data for selected month.</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Add expenses to see category distribution!</p>
          </div>
        ))}
      </section>

      {/* Monthly Trend Section */}
      <section style={{ 
        background: 'var(--glass-bg)', 
        padding: '2rem', 
        borderRadius: '12px',
        border: '1px solid var(--card-border)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
          📊 6-Month Spending Trend
        </h3>
        {loadingForecast && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            Loading trend data...
          </div>
        )}
        {errorForecast && <p className="error">{errorForecast}</p>}
        {!loadingForecast && forecastData.length > 0 ? (
          <>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
              <Bar 
                data={barData} 
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = 'Total: $';
                          if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2);
                          }
                          return label;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                          return '$' + value;
                        }
                      },
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#94a3b8'
                      },
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                      }
                    }
                  }
                }} 
              />
            </div>
            <div style={{ 
              marginTop: '2rem', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div className="stat-card" style={{ margin: 0 }}>
                <div className="stat-label">💵 Average/Month</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  ${(forecastData.reduce((sum, r) => sum + r.total, 0) / forecastData.length).toFixed(2)}
                </div>
              </div>
              <div className="stat-card" style={{ margin: 0 }}>
                <div className="stat-label">📈 Highest Month</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  ${Math.max(...forecastData.map(r => r.total)).toFixed(2)}
                </div>
              </div>
              <div className="stat-card" style={{ margin: 0 }}>
                <div className="stat-label">📉 Lowest Month</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  ${Math.min(...forecastData.map(r => r.total)).toFixed(2)}
                </div>
              </div>
            </div>
          </>
        ) : (!loadingForecast && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
            <p style={{ margin: 0 }}>No forecast data available.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
