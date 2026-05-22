const mongoose = require('mongoose');

const PlanMealSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  diet: String,
  allergens: [String],
  ingredients: [{ name: String, quantity: String }],
  instructions: [String],
  approved: Boolean,
  custom: Boolean,
  slot: String
});

const WeeklyPlanSchema = new mongoose.Schema({
  Monday: { type: [PlanMealSchema], default: [] },
  Tuesday: { type: [PlanMealSchema], default: [] },
  Wednesday: { type: [PlanMealSchema], default: [] },
  Thursday: { type: [PlanMealSchema], default: [] },
  Friday: { type: [PlanMealSchema], default: [] },
  Saturday: { type: [PlanMealSchema], default: [] },
  Sunday: { type: [PlanMealSchema], default: [] }
});

module.exports = mongoose.model('WeeklyPlan', WeeklyPlanSchema);
