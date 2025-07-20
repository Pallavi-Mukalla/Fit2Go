const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Meal = require('../models/Meal');
const authMiddleware = require('../middleware/auth');

// GET meals for the current day by user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
    const meals = await Meal.find({
      userId: req.userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    res.json(meals);
  } catch (err) {
    console.error('Error fetching meals:', err);
    res.status(500).json({ message: 'Error fetching meals', error: err.message });
  }
});

// POST add meal
router.post('/', authMiddleware, async (req, res) => {
  const { tab, name, description, kcal, protein, carbs, fat } = req.body;
  try {
    const newMeal = new Meal({
      userId: req.userId,
      tab: tab || 'Breakfast', // Default to Breakfast if not provided
      name: name || 'Unnamed Meal', // Default name if not provided
      description,
      kcal: Number(kcal) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      checked: false,
      createdAt: new Date()
    });
    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    console.error('Error saving meal:', err);
    res.status(500).json({ message: 'Error saving meal', error: err.message });
  }
});

// POST /api/meals/copy-yesterday - Copy meals from yesterday
router.post('/copy-yesterday', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 0, 0, 0, 0));
    const endOfYesterday = new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 23, 59, 59, 999));

    console.log('Fetching meals for user:', req.userId, 'from', startOfYesterday, 'to', endOfYesterday);

    const yesterdayMeals = await Meal.find({
      userId: req.userId,
      createdAt: { $gte: startOfYesterday, $lte: endOfYesterday }
    });

    console.log('Found yesterday meals:', yesterdayMeals);

    if (yesterdayMeals.length === 0) {
      return res.status(404).json({ message: 'No meals found for yesterday' });
    }

    const newMeals = yesterdayMeals.map(meal => ({
      userId: req.userId,
      tab: meal.tab,
      name: meal.name,
      description: meal.description,
      kcal: meal.kcal,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      checked: false,
      createdAt: new Date()
    }));

    const savedMeals = await Meal.insertMany(newMeals);
    res.status(201).json(savedMeals);
  } catch (err) {
    console.error('Error copying meals:', err);
    res.status(500).json({ message: 'Error copying meals', error: err.message });
  }
});

// DELETE /api/meals/:id - Delete a meal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meal ID' });
    }
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found or not authorized' });
    }
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    console.error('Error deleting meal:', err);
    res.status(500).json({ message: 'Error deleting meal', error: err.message });
  }
});

// PUT /api/meals/:id - Update meal checked status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meal ID' });
    }
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { checked: true },
      { new: true }
    );
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found or not authorized' });
    }
    res.json(meal);
  } catch (err) {
    console.error('Error updating meal:', err);
    res.status(500).json({ message: 'Error updating meal', error: err.message });
  }
});

module.exports = router;