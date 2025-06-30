import express from 'express';
import cors from 'cors';
import dotenv, { config } from 'dotenv';
import { sequelize, testConnection } from "./src/config/db.js";
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
 
import category from './src/models/category.js';
import Product from './src/models/product.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

// API routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Start server after DB connection is tested
const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync(); // Sync models with database
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
