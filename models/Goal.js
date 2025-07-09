const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['weightLoss', 'muscleGain', 'fitness', 'nutrition'], required: true },
  target: { type: Number, required: true }, // e.g., target weight, reps, calories
  unit: { type: String, required: true }, // e.g., kg, lbs, workouts, minutes, km, calories
  progress: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  achieved: { type: Boolean, default: false },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);