import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

function monthString(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;
  const [currentMonth] = useState(monthString());
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError('');
      try {
        // Fetch current month summary
        const { data: summaryData } = await api.get(`/expenses/summary/month?month=${currentMonth}`);
        setSummary(summaryData);

        // Fetch recent expenses (this month)
        const { data: expensesData } = await api.get(`/expenses?month=${currentMonth}`);
        setRecentExpenses(expensesData.slice(0, 5)); // Show only 5 most recent
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [currentMonth]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const pieData = summary && summary.categories ? {
    labels: Object.keys(summary.categories),
    datasets: [
      {
        data: Object.values(summary.categories),
        backgroundColor: ['#38bdf8', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
      }
    ]
  } : null;

  return (
    <div className="card card-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>📊 Dashboard</h2>
          <p style={{ color: 'var(--fg-muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
            {user ? `Welcome back, ${user.name}! 👋` : 'Welcome! 👋'}
          </p>
        </div>
        <button onClick={logout} className="danger" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
          🚪 Log out
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Loading dashboard...
        </div>
      )}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)' }}>
              <div className="stat-label">💵 This Month Total</div>
              <div className="stat-value">
                ${summary?.total?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)' }}>
              <div className="stat-label">📝 Transactions</div>
              <div className="stat-value">
                {summary?.count || 0}
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)' }}>
              <div className="stat-label">📊 Avg Transaction</div>
              <div className="stat-value">
                ${summary?.count > 0 ? (summary.total / summary.count).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Charts and Recent Expenses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Category Distribution Pie Chart */}
            <section style={{ 
              background: 'var(--glass-bg)', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid var(--card-border)' 
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
                🎯 Spending by Category
              </h3>
              {pieData && pieData.labels.length > 0 ? (
                <div style={{ maxWidth: '380px', margin: '0 auto' }}>
                  <Pie data={pieData} options={{ 
                    plugins: { 
                      legend: { 
                        labels: { color: '#e2e8f0', font: { size: 12 } } 
                      }
                    }
                  }} />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                  <p style={{ margin: 0 }}>No expenses yet this month.</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Add your first expense to see the distribution!</p>
                </div>
              )}
            </section>

            {/* Recent Expenses */}
            <section style={{ 
              background: 'var(--glass-bg)', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid var(--card-border)' 
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
                ⏱️ Recent Expenses
              </h3>
              {recentExpenses.length > 0 ? (
                <>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {recentExpenses.map(exp => (
                      <li key={exp.id} style={{ 
                        border: '1px solid var(--glass-border)', 
                        padding: '1rem', 
                        borderRadius: '10px', 
                        marginBottom: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-light)' }}>
                              ${Number(exp.amount).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--fg-muted)', marginTop: '0.35rem' }}>
                              {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)} · {exp.occurredOn}
                            </div>
                            {exp.note && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--fg-subtle)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                                {exp.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => navigate('/expenses')} 
                    style={{ 
                      width: '100%', 
                      marginTop: '1rem', 
                      background: 'transparent', 
                      border: '1px solid var(--primary)', 
                      color: 'var(--primary)',
                      boxShadow: 'none'
                    }}
                  >
                    View All Expenses →
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
                  <p style={{ margin: 0 }}>No recent expenses</p>
                </div>
              )}
            </section>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: '700' }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/expenses')} style={{ flex: '1', minWidth: '200px' }}>
                ➕ Add Expense
              </button>
              <button onClick={() => navigate('/reports')} className="success" style={{ flex: '1', minWidth: '200px' }}>
                📈 View Reports
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
