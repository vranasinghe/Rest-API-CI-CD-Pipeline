const express = require('express');
const path = require('path');
const { router: tasksRouter } = require('./routes/tasks');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/tasks', tasksRouter);

// Fallback Route for API errors
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// General error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

module.exports = app;
