const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Water = require('../models/Water');
const authMiddleware = require('../middleware/auth');

// GET water entries for the current day
router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
    //console.log('Fetching water entries for user:', req.userId, 'from', startOfDay, 'to', endOfDay);
    const waterEntries = await Water.find({
      userId: req.userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    //console.log('Found water entries:', waterEntries);
    res.json(waterEntries);
  } catch (err) {
    console.error('Error fetching water entries:', err);
    res.status(500).json({ message: 'Error fetching water entries', error: err.message });
  }
});

// POST add water entry
router.post('/', authMiddleware, async (req, res) => {
  const { amount, date } = req.body;
  try {
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    const newWater = new Water({
      userId: req.userId,
      amount: Number(amount),
      date: date || new Date().toISOString().slice(0, 10),
      createdAt: new Date()
    });
    const savedWater = await newWater.save();
    res.status(201).json(savedWater);
  } catch (err) {
    console.error('Error saving water entry:', err);
    res.status(500).json({ message: 'Error saving water entry', error: err.message });
  }
});

module.exports = router;