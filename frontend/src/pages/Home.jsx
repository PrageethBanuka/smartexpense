import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Shield, Zap, ArrowRight, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '700px' }}>
        {/* Hero Icon */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            padding: '1.2rem',
            display: 'inline-flex',
          }}>
            <DollarSign size={48} color="white" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Title */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome to SmartExpense
        </h1>
        
        {/* Subtitle */}
        <p style={{ 
          color: 'var(--fg-muted)', 
          fontSize: '1.1rem',
          marginBottom: '2rem',
          lineHeight: '1.8'
        }}>
          Take control of your finances with intelligent expense tracking. 
          Categorize spending, visualize trends, and make smarter financial decisions.
        </p>
        
        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ 
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}><BarChart2 size={24} color="#3b82f6" /></div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Visual Reports</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
              Charts and insights
            </div>
          </div>
          
          <div style={{ 
            padding: '1rem',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}><Shield size={24} color="#8b5cf6" /></div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Secure & Private</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
              Your data is safe
            </div>
          </div>
          
          <div style={{ 
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}><Zap size={24} color="#10b981" /></div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Easy Tracking</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
              Quick and simple
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap'
        }}>
          <Link className="button" to="/register" style={{ minWidth: '200px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <ArrowRight size={18} /> Get Started
          </Link>
          <Link 
            className="button secondary" 
            to="/login" 
            style={{ minWidth: '200px' }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
