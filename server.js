const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/expensetracker';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 3000, () => {
      console.log('🚀 Server running on port 3000');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });