require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const runMigration = require('./utils/migrate');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// Global Middlewares
app.use(cors());
app.use(express.json());

// Connect to Database & Run Migration
connectDB().then(() => {
  runMigration();
});

// Import Modular Routers
const profileRouter = require('./routes/profile');
const recipesRouter = require('./routes/recipes');
const logsRouter = require('./routes/logs');
const plannerRouter = require('./routes/planner');
const barcodeRouter = require('./routes/barcode');
const premiumRouter = require('./routes/premium');
const searchHistoryRouter = require('./routes/searchHistory');

// Mount Router Endpoints
app.use('/api/profile', profileRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/barcode', barcodeRouter);
app.use('/api/premium', premiumRouter);
app.use('/api/search-history', searchHistoryRouter);

// Bind combined endpoints (logs & weight to same router or split mounting)
app.use('/api', logsRouter);        // /api/logs/:date and /api/weight
app.use('/api', plannerRouter);     // /api/weekly-plan and /api/pantry

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
