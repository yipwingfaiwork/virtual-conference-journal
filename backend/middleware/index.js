
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
      'https://lemon-moss-03941a703.6.azurestaticapps.net', // 正確的前端域名
      'http://127.0.0.1:8080', // Fai testing 7/6/2025
      'http://127.0.0.1:3000'  // Fai testing 7/6/2025
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // 與 Azure 門戶設置一致
  }));
  app.use(express.json());
};

module.exports = setupMiddleware;
