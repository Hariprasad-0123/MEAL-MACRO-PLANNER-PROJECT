const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create custom recipe
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe({
      id: 'recipe_' + Date.now(),
      name: req.body.name,
      category: req.body.category || 'lunch',
      calories: Number(req.body.calories) || 0,
      protein: Number(req.body.protein) || 0,
      carbs: Number(req.body.carbs) || 0,
      fat: Number(req.body.fat) || 0,
      diet: req.body.diet || 'none',
      allergens: req.body.allergens || [],
      ingredients: req.body.ingredients || [],
      instructions: req.body.instructions || [],
      approved: req.body.approved !== undefined ? req.body.approved : false,
      custom: true
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update recipe by id
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    Object.assign(recipe, req.body);
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE recipe by id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Recipe.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
