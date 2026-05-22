const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['recipe', 'barcode'],
    default: 'recipe'
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
