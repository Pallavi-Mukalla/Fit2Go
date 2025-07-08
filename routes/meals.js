const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const authMiddleware = require('../middleware/auth'); // to get user id from token

// GET meals by user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId });
    res.json(meals);
  } catch (err) {
    console.error(err);  
    res.status(500).send('Server error');
  }
});

// POST add meal
router.post('/', authMiddleware, async (req, res) => {
  const { tab, name, description, kcal, protein, carbs, fat } = req.body;
  try {
    const newMeal = new Meal({
      userId: req.userId,
      tab,
      name,
      description,
      kcal,
      protein,
      carbs,
      fat
    });
    await newMeal.save();
    res.json(newMeal);
  } catch (err) {
    console.error(err);  
    res.status(500).send('Server error');
  }
});

module.exports = router;
