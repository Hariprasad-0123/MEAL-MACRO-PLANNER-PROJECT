const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  slot: String,
  logId: String
});

const DiaryLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  meals: {
    breakfast: { type: [FoodItemSchema], default: [] },
    lunch: { type: [FoodItemSchema], default: [] },
    dinner: { type: [FoodItemSchema], default: [] }
  },
  water: { type: Number, default: 0 },
  isWorkoutDay: { type: Boolean, default: false }
});

module.exports = mongoose.model('DiaryLog', DiaryLogSchema);
