import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - Get all products with filters and pagination
router.get('/', productController.getAllProducts);

// GET /api/products/low-stock - Get products with low stock
router.get('/low-stock', productController.getLowStockProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct);

// PATCH /api/products/:id/stock - Update product stock
router.patch('/:id/stock', productController.updateStock);

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

export default router;