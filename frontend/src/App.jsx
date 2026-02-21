import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
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
  
  // Check login status whenever the route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location]);
  
  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>💰 SmartExpense</h1>
          <nav>
            <Link to="/">Home</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/expenses">Expenses</Link>
                <Link to="/reports">Reports</Link>
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
