import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import sequelize, { syncDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import postRoutes from './routes/postRoutes.js';

import { genericRoutes } from './routes/genericRoutes.js';
import { capitalizeFirstLetter } from './utils/helpers.js';

// Import all models for generic routes
import * as models from './models/index.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parser
app.use(express.json());

// Database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return syncDatabase();
  })
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch(err => {
    console.error('Unable to connect to the database or synchronize:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);

// Generic CRUD routes for other models
// Dynamically attach generic routes for models not covered by specific controllers
const specificModels = ['User', 'Community', 'Post'];

for (const modelName in models) {
  if (Object.prototype.hasOwnProperty.call(models, modelName) && !specificModels.includes(modelName)) {
    const Model = models[modelName];
    const pluralName = modelName.toLowerCase().endsWith('s') ? modelName.toLowerCase() : modelName.toLowerCase() + 's';
    console.log(`Attaching generic routes for /api/${pluralName}`);
    app.use(`/api/${pluralName}`, genericRoutes(Model));
  }
}

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Community Platform API!' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});
