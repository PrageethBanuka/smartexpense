import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';

function App() {
  return (
    <div>
      <header className="header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ margin: 0 }}>SmartExpense 🔗</h1>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            {localStorage.getItem('token') && <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/expenses">Expenses</Link>
              <Link to="/reports">Reports</Link>
            </>}
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}> 
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">© {new Date().getFullYear()} SmartExpense</div>
      </footer>
    </div>
  );
}

export default App;
