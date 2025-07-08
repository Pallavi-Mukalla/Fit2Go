// models/Meal.js
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tab: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'], required: true },
  name: { type: String, required: true },
  description: String,
  kcal: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meal', mealSchema);
