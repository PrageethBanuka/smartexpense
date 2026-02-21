import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { DollarSign, Home as HomeIcon, LogIn, UserPlus, LayoutDashboard, CreditCard, BarChart2 } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={22} strokeWidth={2.5} /> SmartExpense
          </h1>
          <nav>
            <Link to="/"><HomeIcon size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Home</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/login"><LogIn size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Login</Link>
                <Link to="/register"><UserPlus size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard"><LayoutDashboard size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Dashboard</Link>
                <Link to="/expenses"><CreditCard size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Expenses</Link>
                <Link to="/reports"><BarChart2 size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />Reports</Link>
              </>
            )}
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
        <div className="container">
          © {new Date().getFullYear()} SmartExpense - Built with ❤️ using React, Node.js & DevOps
        </div>
      </footer>
    </div>
  );
}

export default App;
