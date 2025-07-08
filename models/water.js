const mongoose = require('mongoose');

const WaterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true }, // e.g., in liters or ml
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Water', WaterSchema);
