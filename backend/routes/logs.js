const express = require('express');
const router = express.Router();
const DiaryLog = require('../models/DiaryLog');
const WeightLog = require('../models/WeightLog');

// GET diary log for a specific date
router.get('/logs/:date', async (req, res) => {
  try {
    const date = req.params.date;
    let log = await DiaryLog.findOne({ date });
    if (!log) {
      log = await DiaryLog.create({
        date,
        meals: { breakfast: [], lunch: [], dinner: [] },
        water: 0,
        isWorkoutDay: false
      });
    }
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save diary log for a specific date
router.post('/logs/:date', async (req, res) => {
  try {
    const date = req.params.date;
    let log = await DiaryLog.findOne({ date });
    if (!log) {
      log = new DiaryLog({ date });
    }
    Object.assign(log, req.body);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all weight logs sorted by date
router.get('/weight', async (req, res) => {
  try {
    const logs = await WeightLog.find().sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save or update weight log for a specific date
router.post('/weight', async (req, res) => {
  try {
    const { date, weight } = req.body;
    if (!date || isNaN(weight)) {
      return res.status(400).json({ message: 'Invalid weight data' });
    }
    let log = await WeightLog.findOne({ date });
    if (log) {
      log.weight = Number(weight);
    } else {
      log = new WeightLog({ date, weight: Number(weight) });
    }
    await log.save();
    const logs = await WeightLog.find().sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a weight log for a specific date
router.delete('/weight/:date', async (req, res) => {
  try {
    const date = req.params.date;
    await WeightLog.deleteOne({ date });
    const logs = await WeightLog.find().sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all weight logs (Reset)
router.delete('/weight', async (req, res) => {
  try {
    await WeightLog.deleteMany({});
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
