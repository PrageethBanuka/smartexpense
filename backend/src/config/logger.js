/**
 * Structured Logger (pino)
 * ─────────────────────────────────────────────────────────────
 * WHY: console.log outputs unstructured text that's hard to
 *      search, filter, and alert on in production.
 *
 * pino outputs JSON logs like:
 *   {"level":30,"time":1710000000,"msg":"Server listening","port":4000}
 *
 * This makes logs parseable by CloudWatch, ELK, Datadog, etc.
 * In development, pino-pretty formats them nicely in the terminal.
 * ─────────────────────────────────────────────────────────────
 */
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In development, use pino-pretty for readable output
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});

module.exports = logger;
