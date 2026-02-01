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
    <div className="card">
      <h2>Expenses</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label htmlFor="month">Month</label>
          <input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div><strong>Total:</strong> {total.toFixed(2)}</div>
        {loading && <span>Loading…</span>}
      </div>
      {error && <p className="error" style={{ marginTop: '0.5rem' }}>{error}</p>}
      {notice && <p className="result" style={{ marginTop: '0.5rem' }}>{notice}</p>}

      <form onSubmit={onSubmit} style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
        <label htmlFor="amount">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0.01" required value={form.amount} onChange={onChange} />

        <label htmlFor="category">Category</label>
        <select id="category" name="category" value={form.category} onChange={onChange}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label htmlFor="occurredOn">Date</label>
        <input id="occurredOn" name="occurredOn" type="date" required value={form.occurredOn} onChange={onChange} />

        <label htmlFor="note">Note</label>
        <input id="note" name="note" value={form.note} onChange={onChange} placeholder="Optional" />

        <button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" style={{ marginTop: '0.5rem' }} onClick={() => { setEditingId(null); setForm({ amount: '', category: 'food', note: '', occurredOn: new Date().toISOString().slice(0,10) }); }}>Cancel Edit</button>}
      </form>

      <hr style={{ margin: '2rem 0', borderColor: '#1f2937' }} />
      <h3 style={{ marginTop: 0 }}>List</h3>
      {list.length === 0 && !loading && <p style={{ color: 'var(--muted)' }}>No expenses for this month yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map(exp => (
          <li key={exp.id} style={{ border: '1px solid #1f2937', padding: '0.75rem', borderRadius: 6, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <strong>{Number(exp.amount).toFixed(2)}</strong> – {exp.category} – {exp.occurredOn}
              {exp.note && <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{exp.note}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => startEdit(exp)} style={{ padding: '0.4rem 0.6rem' }}>Edit</button>
              <button type="button" onClick={() => remove(exp.id)} style={{ padding: '0.4rem 0.6rem', background: '#f87171', color: '#fff' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
