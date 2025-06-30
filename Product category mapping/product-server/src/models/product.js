import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Category from './category.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate:  {
      notEmpty: true,
      len: [2, 150],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true,
    },
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: Category,
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['sku'],
    },
    {
      fields: ['category_id'],
    },
    {
      fields: ['name'],
    },
  ],
});

// Define associations
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

export default Product;