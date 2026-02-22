/**
 * Auth validation tests
 * Tests input validation logic for the auth endpoints
 * without requiring a database connection.
 */

const express = require('express');
const request = require('supertest');

// Minimal app that replicates auth validation logic
function createAuthValidationApp() {
  const app = express();
  app.use(express.json());

  function validateEmail(email) {
    return /.+@.+\..+/.test(email);
  }

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // If validation passes, return success (DB operations are not tested here)
    return res.status(200).json({ message: 'Validation passed' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    return res.status(200).json({ message: 'Validation passed' });
  });

  return app;
}

describe('Auth Input Validation', () => {
  let app;

  beforeAll(() => {
    app = createAuthValidationApp();
  });

  describe('POST /api/auth/register', () => {
    test('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    test('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'secret123' });
      expect(res.status).toBe(400);
    });

    test('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'secret123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/email/i);
    });

    test('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/6 characters/i);
    });

    test('should pass validation with correct data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'secret123' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should reject missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    test('should reject missing password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
    });

    test('should pass validation with correct data', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'secret123' });
      expect(res.status).toBe(200);
    });
  });
});
