import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

// GET /api/categories - Get all categories with pagination
router.get('/', categoryController.getAllCategories);
 
// GET /api/categories/stats - Get categories with product count
router.get('/stats', categoryController.getCategoriesWithProductCount);

// GET /api/categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;