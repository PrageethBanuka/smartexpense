/**
 * Expense validation tests
 * Tests input validation for expense endpoints
 * without requiring a database connection.
 */

const express = require('express');
const request = require('supertest');

const ALLOWED_CATEGORIES = ['food', 'transport', 'bills', 'entertainment', 'other'];

// Minimal app replicating expense validation
function createExpenseValidationApp() {
  const app = express();
  app.use(express.json());

  // Simulate auth middleware (always passes with userId=1)
  app.use((req, _res, next) => {
    req.userId = 1;
    next();
  });

  app.post('/api/expenses', (req, res) => {
    const { amount, category, occurredOn } = req.body || {};
    if (amount == null || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount must be > 0' });
    }
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
    }
    if (occurredOn) {
      const d = new Date(occurredOn);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid occurredOn date' });
      }
    }
    return res.status(201).json({ message: 'Validation passed' });
  });

  return app;
}

describe('Expense Input Validation', () => {
  let app;

  beforeAll(() => {
    app = createExpenseValidationApp();
  });

  test('should reject missing amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ category: 'food' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/amount/i);
  });

  test('should reject zero amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 0, category: 'food' });
    expect(res.status).toBe(400);
  });

  test('should reject negative amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: -5, category: 'food' });
    expect(res.status).toBe(400);
  });

  test('should reject invalid category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 10, category: 'invalid_category' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/category/i);
  });

  test('should reject missing category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 10 });
    expect(res.status).toBe(400);
  });

  test('should accept valid expense data', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 12.50, category: 'food', occurredOn: '2025-11-01' });
    expect(res.status).toBe(201);
  });

  test('should accept all valid categories', async () => {
    for (const cat of ALLOWED_CATEGORIES) {
      const res = await request(app)
        .post('/api/expenses')
        .send({ amount: 5, category: cat });
      expect(res.status).toBe(201);
    }
  });

  test('should reject invalid date format', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 10, category: 'food', occurredOn: 'not-a-date' });
    expect(res.status).toBe(400);
  });
});
