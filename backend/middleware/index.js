
const cors = require('cors');
const express = require('express');

const setupMiddleware = (app) => {
  const corsOptions = {
    origin: function (origin, callback) {
      // 允許的來源清單
      const allowedOrigins = [
        'https://lemon-moss-03941a703.6.azurestaticapps.net',
        'http://localhost:3000',
        'http://localhost:8080', // Vite dev server
        'http://localhost:5001'
      ];
      
      // 允許無來源的請求（比如移動應用或 Postman）
      if (!origin) return callback(null, true);
      
      // 檢查來源是否在允許清單中
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
  };

  // 啟用 CORS
  app.use(cors(corsOptions));
  
  // 處理預檢請求
  app.options('*', (req, res) => {
    console.log('Handling OPTIONS request for:', req.path);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.status(200).end();
  });

  // 添加額外的 CORS 標頭
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (
      origin === 'https://lemon-moss-03941a703.6.azurestaticapps.net' ||
      origin.includes('localhost')
    )) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    console.log(`${req.method} ${req.path} from origin: ${origin || 'no-origin'}`);
    
    next();
  });

  // JSON 解析中間件
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
};

module.exports = setupMiddleware;
