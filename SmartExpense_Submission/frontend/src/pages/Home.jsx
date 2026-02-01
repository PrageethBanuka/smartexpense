import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2>Welcome to SmartExpense</h2>
      <p className="" style={{ color: 'var(--muted)' }}>
        Track your daily expenses, categorize spending, and see monthly summaries.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
        <Link className="button" to="/register">Get Started</Link>
        <Link className="button" to="/login">I already have an account</Link>
      </div>
    </div>
  );
}
