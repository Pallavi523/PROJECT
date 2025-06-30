import categoryService from '../services/categoryService.js';

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const { page, limit, includeProducts } = req.query;
      const result = await categoryService.getAllCategories({
        page,
        limit,
        includeProducts: includeProducts === 'true',
      });
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message,
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const { includeProducts } = req.query;
      
      const category = await categoryService.getCategoryById(
        parseInt(id),
        includeProducts === 'true'
      );
      
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      const statusCode = error.message === 'Category not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const category = await categoryService.createCategory(categoryData);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      const statusCode = error.message === 'Category name already exists' ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const category = await categoryService.updateCategory(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Category not found') statusCode = 404;
      if (error.message === 'Category name already exists') statusCode = 409;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategory(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Category not found') statusCode = 404;
      if (error.message === 'Cannot delete category with associated products') statusCode = 409;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategoriesWithProductCount(req, res) {
    try {
      const categories = await categoryService.getCategoriesWithProductCount();
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories with product count',
        error: error.message,
      });
    }
  }
}

export default new CategoryController();