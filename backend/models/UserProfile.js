const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  age: { type: Number, default: 28 },
  weight: { type: Number, default: 70 },
  height: { type: Number, default: 175 },
  gender: { type: String, default: 'male' },
  activityLevel: { type: String, default: 'moderate' },
  goal: { type: String, default: 'maintain' },
  dietPreference: { type: String, default: 'none' },
  allergies: [String],
  customMacros: {
    protein: { type: Number, default: null },
    carbs: { type: Number, default: null },
    fat: { type: Number, default: null }
  },
  isPremium: { type: Boolean, default: false },
  calorieCycling: {
    workoutDays: { type: [String], default: ['Monday', 'Wednesday', 'Friday'] },
    workoutCalorieMultiplier: { type: Number, default: 1.2 },
    restCalorieMultiplier: { type: Number, default: 0.9 }
  }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
