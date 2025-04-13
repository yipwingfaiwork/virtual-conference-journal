
const cors = require('cors');
const express = require('express');

// Configure and export middleware
const setupMiddleware = (app) => {
  // Apply middleware
  app.use(cors());
  app.use(express.json());
};

module.exports = setupMiddleware;
