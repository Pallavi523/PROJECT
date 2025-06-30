import Category from '../models/category.js';
import Product from '../models/product.js';

class CategoryService {
  async getAllCategories(options = {}) {
    const { page = 1, limit = 10, includeProducts = false } = options;
    const offset = (page - 1) * limit;

    const queryOptions = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    };

    if (includeProducts) {
      queryOptions.include = [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'stock'],
      }];
    }

    const { count, rows } = await Category.findAndCountAll(queryOptions);

    return {
      categories: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getCategoryById(id, includeProducts = false) {
    const queryOptions = {
      where: { id },
    };

    if (includeProducts) {
      queryOptions.include = [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'price', 'stock', 'sku'],
      }];
    }

    const category = await Category.findOne(queryOptions);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  
  async createCategory(categoryData) {
    try {
      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  async updateCategory(id, updateData) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }

    try {
      await category.update(updateData);
      return category;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has products
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    await category.destroy();
    return { message: 'Category deleted successfully' };
  }

  async getCategoriesWithProductCount() {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'description',
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount'],
      ],
      include: [{
        model: Product,
        as: 'products',
        attributes: [],
      }],
      group: ['Category.id'],
      order: [['name', 'ASC']],
    });

    return categories;
  }
}

export default new CategoryService();