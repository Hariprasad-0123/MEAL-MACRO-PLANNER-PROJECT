const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// Simulated Premium Payment Endpoint
router.post('/pay', async (req, res) => {
  const { cardNumber, name, expiry, cvv } = req.body;
  if (!cardNumber || !expiry || !cvv) {
    return res.status(400).json({ message: 'Missing card payment details' });
  }
  try {
    let profile = await UserProfile.findOne();
    if (!profile) {
      profile = new UserProfile({});
    }
    profile.isPremium = true;
    await profile.save();
    res.json({ success: true, message: 'Premium Tier Activated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
