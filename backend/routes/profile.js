const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// GET user profile
router.get('/', async (req, res) => {
  try {
    let profile = await UserProfile.findOne();
    if (!profile) {
      profile = await UserProfile.create({});
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update user profile
router.post('/', async (req, res) => {
  try {
    let profile = await UserProfile.findOne();
    if (!profile) {
      profile = new UserProfile({});
    }
    Object.assign(profile, req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
