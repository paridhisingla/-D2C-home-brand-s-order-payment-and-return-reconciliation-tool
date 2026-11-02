require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const stageUpdateRoutes = require('./routes/stageUpdates');
const buyerRoutes = require('./routes/buyer');
const { classifyTamilNote } = require('../src/lib/aiClassifier.mjs');
const { computeRunRate } = require('../src/lib/runRateEngine.mjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KnitTrack Express + MongoDB API',
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected/in-memory fallback',
    timestamp: new Date().toISOString(),
  });
});

// Delay Engine Direct Endpoint
app.post('/api/delay-engine/compute', (req, res) => {
  try {
    const result = computeRunRate(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// AI Classifier Direct Endpoint (Tamil note -> English category with confidence score & fallback)
app.post('/api/ai/classify', (req, res) => {
  try {
    const { note } = req.body;
    const classification = classifyTamilNote(note || '');
    res.json({ success: true, classification });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'AI Classification failed, mock fallback engaged',
      classification: {
        originalTamil: req.body?.note || '',
        englishTranslation: 'Floor issue reported (Requires human review)',
        predictedCategory: 'Other / Uncategorized',
        confidence: 0.4,
        needsReview: true,
      },
    });
  }
});

// Register Core Routers
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stage-updates', stageUpdateRoutes);
app.use('/api/buyer', buyerRoutes);

// Database Connection with graceful fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/knittrack';

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      console.log('Connecting to MongoDB Atlas / URI...');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB successfully connected!');
    } else {
      console.log('Notice: MONGODB_URI not set. Running Express server with in-memory / local connection.');
      // Attempt local connect, but don't crash if Mongo is not running locally
      mongoose.connect('mongodb://127.0.0.1:27017/knittrack', { serverSelectionTimeoutMS: 2000 }).catch(() => {
        console.log('Running without local MongoDB daemon; API ready for Atlas connection string.');
      });
    }
  } catch (err) {
    console.warn('MongoDB connection warning:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`KnitTrack Express + MongoDB API Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
