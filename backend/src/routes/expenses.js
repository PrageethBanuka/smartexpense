const express = require('express');
const { Op } = require('sequelize');
const { Expense } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const ALLOWED_CATEGORIES = ['food', 'transport', 'bills', 'entertainment', 'other'];

function parseMonthRange(monthStr) {
  // monthStr format: YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(monthStr)) return null;
  const start = new Date(`${monthStr}-01T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

// Create
router.post('/', async (req, res) => {
  try {
    const { amount, category, note, occurredOn } = req.body || {};
    if (amount === null || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ message: 'amount must be > 0' });
    }
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
    }
    const dateValue = occurredOn ? new Date(occurredOn) : new Date();
  if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({ message: 'Invalid occurredOn date' });
    }
    const expense = await Expense.create({
      userId: req.userId,
      amount,
      category,
      note: note || null,
      occurredOn: dateValue.toISOString().slice(0, 10),
    });
    return res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const where = { userId: req.userId };
    if (month) {
      const range = parseMonthRange(month);
      if (!range) {
        return res.status(400).json({ message: 'month must be YYYY-MM' });
      }
      where.occurredOn = { [Op.gte]: range.start.toISOString().slice(0, 10), [Op.lt]: range.end.toISOString().slice(0, 10) };
    }
    const expenses = await Expense.findAll({ where, order: [['occurredOn', 'DESC'], ['createdAt', 'DESC']] });
    return res.json(expenses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    return res.json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    const { amount, category, note, occurredOn } = req.body || {};
    if (amount !== null && amount !== undefined) {
      if (Number(amount) <= 0) return res.status(400).json({ message: 'amount must be > 0' });
      expense.amount = amount;
    }
    if (category) {
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
      }
      expense.category = category;
    }
    if (note !== undefined) expense.note = note;
    if (occurredOn) {
      const d = new Date(occurredOn);
  if (Number.isNaN(d.getTime())) {
    return res.status(400).json({ message: 'Invalid occurredOn date' });
  }
      expense.occurredOn = d.toISOString().slice(0, 10);
    }
    await expense.save();
    return res.json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.destroy({ where: { id: req.params.id, userId: req.userId } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Summary by category for a month
router.get('/summary/month', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });
    const range = parseMonthRange(month);
    if (!range) return res.status(400).json({ message: 'month must be YYYY-MM' });
    const rows = await Expense.findAll({
      where: {
        userId: req.userId,
        occurredOn: { [Op.gte]: range.start.toISOString().slice(0, 10), [Op.lt]: range.end.toISOString().slice(0, 10) },
      },
      attributes: ['category', [Expense.sequelize.fn('SUM', Expense.sequelize.col('amount')), 'total']],
      group: ['category'],
    });
    const summary = {};
    let grandTotal = 0;
    for (const r of rows) {
      const category = r.get('category');
      const total = Number.parseFloat(r.get('total'));
      summary[category] = total;
      grandTotal += total;
    }
    return res.json({ month, categories: summary, total: grandTotal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
