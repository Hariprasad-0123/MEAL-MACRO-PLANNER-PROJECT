const mongoose = require('mongoose');

const PantrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, default: '1 serving' },
  checked: { type: Boolean, default: false }
});

module.exports = mongoose.model('Pantry', PantrySchema);
