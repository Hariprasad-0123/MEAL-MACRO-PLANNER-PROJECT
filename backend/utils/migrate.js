const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');
const UserProfile = require('../models/UserProfile');
const DiaryLog = require('../models/DiaryLog');
const WeightLog = require('../models/WeightLog');
const WeeklyPlan = require('../models/WeeklyPlan');
const Pantry = require('../models/Pantry');

// Load mock recipes helper
function loadMockRecipes() {
  const mockRecipesPath = path.join(__dirname, '../../frontend/src/mockRecipes.json');
  try {
    const mockFileContent = fs.readFileSync(mockRecipesPath, 'utf8');
    return JSON.parse(mockFileContent);
  } catch (e) {
    console.error('Could not read mockRecipes.json:', e);
    return [];
  }
}

// Legacy JSON to MongoDB Database Migrator
async function runMigration() {
  try {
    const DB_PATH = path.join(__dirname, '../db.json');
    if (!fs.existsSync(DB_PATH)) {
      // Pre-populate DB defaults if no JSON db.json file is found
      const recipeCount = await Recipe.countDocuments();
      if (recipeCount === 0) {
        console.log('No recipes found in MongoDB. Loading defaults.');
        const mockRecipes = loadMockRecipes();
        if (mockRecipes.length > 0) {
          await Recipe.insertMany(mockRecipes);
        }
      }
      
      const profileCount = await UserProfile.countDocuments();
      if (profileCount === 0) {
        await UserProfile.create({});
      }
      return;
    }

    console.log('Found legacy db.json file. Starting automatic MongoDB migration...');
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // 1. Migrate recipes
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount === 0 && db.recipes) {
      console.log(`Migrating ${db.recipes.length} recipes...`);
      await Recipe.insertMany(db.recipes.map(r => ({
        id: r.id || 'recipe_' + Math.random().toString(36).substr(2, 9),
        name: r.name,
        category: r.category,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        diet: r.diet,
        allergens: r.allergens,
        ingredients: r.ingredients,
        instructions: r.instructions,
        approved: r.approved !== undefined ? r.approved : true,
        custom: r.custom !== undefined ? r.custom : false,
        favorite: r.favorite !== undefined ? r.favorite : false
      })));
    }

    // 2. Migrate userProfile
    const profileCount = await UserProfile.countDocuments();
    if (profileCount === 0 && db.userProfile) {
      console.log('Migrating user profile...');
      await UserProfile.create({
        age: db.userProfile.age,
        weight: db.userProfile.weight,
        height: db.userProfile.height,
        gender: db.userProfile.gender,
        activityLevel: db.userProfile.activityLevel,
        goal: db.userProfile.goal,
        dietPreference: db.userProfile.dietPreference,
        allergies: db.userProfile.allergies,
        customMacros: db.userProfile.customMacros || { protein: null, carbs: null, fat: null },
        isPremium: db.userProfile.isPremium || false,
        calorieCycling: db.userProfile.calorieCycling || {
          workoutDays: ["Monday", "Wednesday", "Friday"],
          workoutCalorieMultiplier: 1.2,
          restCalorieMultiplier: 0.9
        }
      });
    }

    // 3. Migrate diaryLogs
    const diaryCount = await DiaryLog.countDocuments();
    if (diaryCount === 0 && db.diaryLogs) {
      console.log('Migrating diary logs...');
      const logs = [];
      for (const [date, logData] of Object.entries(db.diaryLogs)) {
        logs.push({
          date,
          meals: logData.meals || { breakfast: [], lunch: [], dinner: [] },
          water: logData.water || 0,
          isWorkoutDay: logData.isWorkoutDay || false
        });
      }
      if (logs.length > 0) {
        await DiaryLog.insertMany(logs);
      }
    }

    // 4. Migrate weightLogs
    const weightCount = await WeightLog.countDocuments();
    if (weightCount === 0 && db.weightLogs) {
      console.log(`Migrating ${db.weightLogs.length} weight logs...`);
      await WeightLog.insertMany(db.weightLogs);
    }

    // 5. Migrate weeklyPlan
    const planCount = await WeeklyPlan.countDocuments();
    if (planCount === 0 && db.weeklyPlan) {
      console.log('Migrating weekly plan...');
      await WeeklyPlan.create(db.weeklyPlan);
    }

    // 6. Migrate pantry
    const pantryCount = await Pantry.countDocuments();
    if (pantryCount === 0 && db.pantry) {
      console.log(`Migrating ${db.pantry.length} pantry items...`);
      await Pantry.insertMany(db.pantry);
    }

    console.log('🎉 MongoDB Data Migration fully completed!');
    
    // Rename legacy db.json to db.json.migrated so it doesn't run again!
    fs.renameSync(DB_PATH, DB_PATH + '.migrated');
    console.log('Legacy db.json renamed to db.json.migrated.');

  } catch (err) {
    console.error('Error migrating legacy database to MongoDB:', err);
  }
}

module.exports = runMigration;
