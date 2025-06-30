import Product from '../models/product.js';
import Category from '../models/category.js';
import { Op } from 'sequelize';

class ProductService {
  async getAllProducts(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      categoryId, 
      search, 
      minPrice, 
      maxPrice,
      inStock 
    } = options;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = minPrice;
      if (maxPrice) whereClause.price[Op.lte] = maxPrice;
    }
    
    if (inStock === 'true') {
      whereClause.stock = { [Op.gt]: 0 };
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getProductById(id) {
    const product = await Product.findOne({
      where: { id },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'description'],
      }],
    });

    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(productData) {
    // Check if category exists
    const category = await Category.findByPk(productData.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    try {
      const product = await Product.create(productData);
      return await this.getProductById(product.id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('SKU already exists');
      }
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if category exists when updating categoryId
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    try {
      await product.update(updateData);
      return await this.getProductById(id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('SKU already exists');
      }
      throw error;
    }
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await product.destroy();
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id, quantity, operation = 'set') {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.stock + quantity;
        break;
      case 'subtract':
        newStock = product.stock - quantity;
        break;
      case 'set':
      default:
        newStock = quantity;
        break;
    }

    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    await product.update({ stock: newStock });
    return await this.getProductById(id);
  }

  async getLowStockProducts(threshold = 10) {
    const products = await Product.findAll({
      where: {
        stock: { [Op.lte]: threshold },
        isActive: true,
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      }],
      order: [['stock', 'ASC']],
    });

    return products;
  }
}

export default new ProductService();