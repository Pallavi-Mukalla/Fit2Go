const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const Water = require('../models/Water'); // create this model next

// GET today's water intake
router.get('/', authMiddleware, async (req, res) => {
  try {
    const waterEntries = await Water.find({ userId: req.userId });
    res.json(waterEntries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST add water entry
router.post('/', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  try {
    const newEntry = new Water({
      userId: req.userId,
      amount,
      date: new Date()
    });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
