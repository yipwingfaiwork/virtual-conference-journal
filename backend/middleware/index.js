const cors = require('cors');
const express = require('express');

const setupMiddleware = (app) => {
  const corsOptions = {
    origin: [
      'https://lemon-moss-03941a703.6.azurestaticapps.net',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // 處理預檢請求
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // 明確處理 OPTIONS 請求

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json());
};

module.exports = setupMiddleware;