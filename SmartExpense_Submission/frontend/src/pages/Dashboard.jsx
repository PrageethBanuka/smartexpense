import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--muted)' }}>
        {user ? `Hello, ${user.name}!` : 'You are logged in.'}
      </p>
      <p>
        This is a placeholder dashboard. Next steps: add Expenses CRUD and charts.
      </p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
