const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: ISO Timestamp or YYYY-MM-DD
  weight: { type: Number, required: true }
});

module.exports = mongoose.model('WeightLog', WeightLogSchema);
