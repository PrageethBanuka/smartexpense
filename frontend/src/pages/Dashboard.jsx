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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
            {user ? `Welcome back, ${user.name}!` : 'Welcome!'}
          </p>
        </div>
        <button onClick={logout}>Log out</button>
      </div>

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '1rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <div style={{ fontSize: '0.875rem', color: '#bfdbfe', marginBottom: '0.5rem' }}>This Month Total</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff' }}>
                ${summary?.total?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '1rem', background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
              <div style={{ fontSize: '0.875rem', color: '#d1fae5', marginBottom: '0.5rem' }}>Transactions</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff' }}>
                {summary?.count || 0}
              </div>
            </div>
            <div style={{ border: '1px solid #1f2937', borderRadius: '8px', padding: '1rem', background: 'linear-gradient(135deg, #7c2d12 0%, #f59e0b 100%)' }}>
              <div style={{ fontSize: '0.875rem', color: '#fed7aa', marginBottom: '0.5rem' }}>Avg per Transaction</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff' }}>
                ${summary?.count > 0 ? (summary.total / summary.count).toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Charts and Recent Expenses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Category Distribution Pie Chart */}
            <section>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Spending by Category</h3>
              {pieData && pieData.labels.length > 0 ? (
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <Pie data={pieData} />
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
                  No expenses yet this month. Add your first expense!
                </p>
              )}
            </section>

            {/* Recent Expenses */}
            <section>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent Expenses</h3>
              {recentExpenses.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentExpenses.map(exp => (
                    <li key={exp.id} style={{ border: '1px solid #1f2937', padding: '0.75rem', borderRadius: 6, marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#38bdf8' }}>
                            ${Number(exp.amount).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                            {exp.category} · {exp.occurredOn}
                          </div>
                          {exp.note && (
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                              {exp.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
                  No recent expenses
                </p>
              )}
              {recentExpenses.length > 0 && (
                <button 
                  onClick={() => navigate('/expenses')} 
                  style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8' }}
                >
                  View All Expenses
                </button>
              )}
            </section>
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #1f2937' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/expenses')} style={{ background: '#3b82f6' }}>
                Add Expense
              </button>
              <button onClick={() => navigate('/reports')} style={{ background: '#10b981' }}>
                View Reports
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
