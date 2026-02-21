import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CATEGORIES = ['food', 'transport', 'bills', 'entertainment', 'other'];

function monthString(d = new Date()) { return d.toISOString().slice(0,7); }

export default function Expenses() {
  const [month, setMonth] = useState(monthString());
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: '', category: 'food', note: '', occurredOn: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const params = month ? `?month=${month}` : '';
      const { data } = await api.get(`/expenses${params}`);
      setList(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load expenses');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [month]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setNotice('');
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, form);
        setNotice('Expense updated');
      } else {
        await api.post('/expenses', form);
        setNotice('Expense added');
      }
      setForm({ amount: '', category: 'food', note: '', occurredOn: new Date().toISOString().slice(0,10) });
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function startEdit(exp) {
    setEditingId(exp.id);
    setForm({
      amount: exp.amount,
      category: exp.category,
      note: exp.note || '',
      occurredOn: exp.occurredOn,
    });
  }

  async function remove(id) {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setNotice('Expense deleted');
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  }

  const total = list.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <div className="card card-wide">
      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>💳 Expenses</h2>
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label htmlFor="month" style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>
            📅 Select Month
          </label>
          <input 
            id="month" 
            type="month" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="stat-card" style={{ flex: '1', minWidth: '200px', margin: 0 }}>
          <div className="stat-label">Total for {month}</div>
          <div className="stat-value" style={{ fontSize: '1.75rem' }}>
            ${total.toFixed(2)}
          </div>
        </div>
        {loading && <span style={{ color: 'var(--primary)' }}>⏳ Loading…</span>}
      </div>
      {error && <p className="error">{error}</p>}
      {notice && <p className="result">✅ {notice}</p>}

      <form onSubmit={onSubmit} style={{ 
        marginTop: '1.5rem', 
        background: 'var(--glass-bg)', 
        padding: '1.5rem', 
        borderRadius: '12px',
        border: '1px solid var(--card-border)' 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: '700' }}>
          {editingId ? '✏️ Edit Expense' : '➕ Add New Expense'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label htmlFor="amount">Amount ($)</label>
            <input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              min="0.01" 
              required 
              value={form.amount} 
              onChange={onChange}
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              name="category" 
              value={form.category} 
              onChange={onChange}
              style={{ width: '100%' }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="occurredOn">Date</label>
            <input 
              id="occurredOn" 
              name="occurredOn" 
              type="date" 
              required 
              value={form.occurredOn} 
              onChange={onChange}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="note">Note (Optional)</label>
          <input 
            id="note" 
            name="note" 
            value={form.note} 
            onChange={onChange} 
            placeholder="Add a description..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button type="submit" disabled={saving} style={{ flex: '1', minWidth: '150px' }}>
            {saving ? '⏳ Saving…' : editingId ? '💾 Update' : '➕ Add'}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="secondary"
              style={{ flex: '1', minWidth: '150px', marginTop: 0 }} 
              onClick={() => { 
                setEditingId(null); 
                setForm({ amount: '', category: 'food', note: '', occurredOn: new Date().toISOString().slice(0,10) }); 
              }}
            >
              ❌ Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: '700' }}>
          📋 Expense List
        </h3>
        {list.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: 'var(--glass-bg)', 
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            color: 'var(--fg-muted)' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
            <p style={{ margin: 0, fontSize: '1.05rem' }}>No expenses for this month yet.</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Start tracking by adding your first expense above!</p>
          </div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map(exp => (
            <li 
              key={exp.id} 
              style={{ 
                border: '1px solid var(--glass-border)', 
                padding: '1.25rem', 
                borderRadius: '10px', 
                marginBottom: '0.75rem', 
                background: 'var(--glass-bg)',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '1.5rem',
                flexWrap: 'wrap',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>
                  ${Number(exp.amount).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--fg-muted)', marginBottom: '0.25rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.25rem 0.75rem', 
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginRight: '0.5rem'
                  }}>
                    {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
                  </span>
                  📅 {exp.occurredOn}
                </div>
                {exp.note && (
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--fg-subtle)', 
                    marginTop: '0.5rem',
                    fontStyle: 'italic',
                    paddingLeft: '0.5rem',
                    borderLeft: '2px solid var(--glass-border)'
                  }}>
                    {exp.note}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => startEdit(exp)} 
                  style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    boxShadow: 'none',
                    fontSize: '0.9rem',
                    width: 'auto'
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  type="button" 
                  onClick={() => remove(exp.id)} 
                  className="danger"
                  style={{ 
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    width: 'auto'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
