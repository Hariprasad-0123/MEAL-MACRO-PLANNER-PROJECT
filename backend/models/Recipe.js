const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // For seamless frontend lookup compatibility
  name: { type: String, required: true },
  category: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  diet: { type: String, default: 'none' },
  allergens: [String],
  ingredients: [{
    name: String,
    quantity: String
  }],
  instructions: [String],
  approved: { type: Boolean, default: false },
  custom: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
