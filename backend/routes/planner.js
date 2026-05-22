const express = require('express');
const router = express.Router();
const WeeklyPlan = require('../models/WeeklyPlan');
const Pantry = require('../models/Pantry');

// GET weekly meal plan
router.get('/weekly-plan', async (req, res) => {
  try {
    let plan = await WeeklyPlan.findOne();
    if (!plan) {
      plan = await WeeklyPlan.create({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
      });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save weekly meal plan
router.post('/weekly-plan', async (req, res) => {
  try {
    let plan = await WeeklyPlan.findOne();
    if (!plan) {
      plan = new WeeklyPlan({});
    }
    Object.assign(plan, req.body);
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pantry items
router.get('/pantry', async (req, res) => {
  try {
    const pantry = await Pantry.find();
    res.json(pantry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update pantry items list
router.post('/pantry', async (req, res) => {
  try {
    await Pantry.deleteMany({});
    const pantry = await Pantry.insertMany(req.body);
    res.json(pantry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
