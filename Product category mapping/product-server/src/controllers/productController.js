import productService from '../services/productService.js';

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { page, limit, categoryId, search, minPrice, maxPrice, inStock } = req.query;
      
      const result = await productService.getAllProducts({
        page,
        limit,
        categoryId,
        search,
        minPrice,
        maxPrice,
        inStock,
      });
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message,
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const productData = req.body;
      const product = await productService.createProduct(productData);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      let statusCode = 400;
      if (error.message === 'Category not found') statusCode = 404;
      if (error.message === 'SKU already exists') statusCode = 409;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await productService.updateProduct(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Product not found') statusCode = 404;
      if (error.message === 'Category not found') statusCode = 404;
      if (error.message === 'SKU already exists') statusCode = 409;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message === 'Product not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;
      
      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          success: false,
          message: 'Quantity is required',
        });
      }
      
      const product = await productService.updateStock(
        parseInt(id),
        parseInt(quantity),
        operation
      );
      
      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: product,
      });
    } catch (error) {
      let statusCode = 500;
      if (error.message === 'Product not found') statusCode = 404;
      if (error.message === 'Stock cannot be negative') statusCode = 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLowStockProducts(req, res) {
    try {
      const { threshold = 10 } = req.query;
      const products = await productService.getLowStockProducts(parseInt(threshold));
      
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock products',
        error: error.message,
      });
    }
  }
}

export default new ProductController();