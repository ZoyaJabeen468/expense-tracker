const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }
    const expense = new Expense({ title, amount, category, date, description });
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, date, description },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET summary
router.get('/stats/summary', async (req, res) => {
  try {
    const expenses = await Expense.find();
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    res.json({ total, byCategory, count: expenses.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;