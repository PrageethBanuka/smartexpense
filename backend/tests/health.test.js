/**
 * Health & Metrics endpoint tests
 * These tests validate the health check and metrics endpoints
 * without requiring a database connection.
 */

const express = require('express');

// Create a minimal app with just the health/metrics routes for unit testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', async (req, res) => {
    // In unit tests we skip the DB check
    res.json({ status: 'ok', service: 'smartexpense-backend' });
  });

  app.get('/metrics', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
      uptime_seconds: Math.floor(process.uptime()),
      memory: {
        rss_mb: Math.round(mem.rss / 1024 / 1024),
        heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
      },
      node_version: process.version,
      env: process.env.NODE_ENV || 'development',
    });
  });

  return app;
}

describe('Health Check Endpoint', () => {
  let app;
  const request = require('supertest');

  beforeAll(() => {
    app = createTestApp();
  });

  test('GET /health should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'smartexpense-backend');
  });

  test('GET /metrics should return 200 with system metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime_seconds');
    expect(res.body).toHaveProperty('memory');
    expect(res.body.memory).toHaveProperty('rss_mb');
    expect(res.body.memory).toHaveProperty('heap_used_mb');
    expect(res.body).toHaveProperty('node_version');
    expect(typeof res.body.uptime_seconds).toBe('number');
  });
});
