
//const cors = require('cors');
//const express = require('express');

//// Configure and export middleware
//const setupMiddleware = (app) => {
////  // Apply middleware
//  app.use(cors());
//  app.use(express.json());
//};

//module.exports = setupMiddleware;


//16/5/25 Fai update
const cors = require('cors');
const express = require('express');

const setupMiddleware = (app) => {
  app.use(cors({
    origin: [
      'https://lemon-moss-03941a703.azurestaticapps.net',
      'https://lemon-moss-03941a703.6.azurestaticapps.net'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  }));
  app.use(express.json());
};

module.exports = setupMiddleware;