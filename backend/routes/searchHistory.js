const express = require('express');
const router = express.Router();
const SearchHistory = require('../models/SearchHistory');

// GET all search history
router.get('/', async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save a search history entry
router.post('/', async (req, res) => {
  try {
    const { query, type, resultsCount } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const newEntry = new SearchHistory({
      query,
      type: type || 'recipe',
      resultsCount: resultsCount || 0
    });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a specific search history entry by id
router.delete('/:id', async (req, res) => {
  try {
    const result = await SearchHistory.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Search entry not found' });
    }
    res.json({ message: 'Search history entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE clear all search history
router.delete('/', async (req, res) => {
  try {
    await SearchHistory.deleteMany({});
    res.json({ message: 'All search history cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
