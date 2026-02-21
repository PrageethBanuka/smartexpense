import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
      setNotice(`Welcome back, ${data.name}! Redirecting…`);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '14px', padding: '0.9rem', display: 'inline-flex' }}>
              <Lock size={32} color="white" strokeWidth={2} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Welcome Back</h2>
          <p style={{ color: 'var(--fg-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Log in to continue managing your expenses
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={14} /> Email Address
          </label>
          <input 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="you@example.com"
          />

          <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={14} /> Password
          </label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Enter your password"
          />

          <button type="submit" disabled={loading} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? <><Loader2 size={16} className="spin" /> Logging in…</> : <><LogIn size={16} /> Login</>}
          </button>
        </form>
        
        {error && <p className="error">{error}</p>}
        {notice && <p className="result" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} /> {notice}</p>}
        
        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid var(--glass-border)',
          textAlign: 'center',
          color: 'var(--fg-muted)',
          fontSize: '0.9rem'
        }}>
          Don't have an account? <a href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign up</a>
        </div>
      </div>
    </div>
  );
}
