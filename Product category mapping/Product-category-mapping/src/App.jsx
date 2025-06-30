import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AddProducts } from './AddProducts';
import { AddCategory } from './AddCategory';

export default function ProductCategoryApp() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
 // const [loading, setLoading] = useState(false);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      setProducts(data.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      const data = await response.json();
      setCategories(data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Callbacks to refetch after adding
  const handleProductAdded = () => {
    fetchProducts();
    setShowAddProductForm(false);
  };

  const handleCategoryAdded = () => {
    fetchCategories();
    setShowAddCategoryForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Category Mapping</h1>

        {/* Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowAddProductForm(!showAddProductForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} />
            {showAddProductForm ? 'Close Product Form' : 'Add Product'}
          </button>

          <button
            onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={18} />
            {showAddCategoryForm ? 'Close Category Form' : 'Add Category'}
          </button>
        </div>

        {/* Add Product Form */}
        {showAddProductForm && <AddProducts onProductAdded={handleProductAdded} />}

        {/* Add Category Form */}
        {showAddCategoryForm && <AddCategory onCategoryAdded={handleCategoryAdded} />}

        {/* Product Table */}
        <div className="overflow-x-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Price</th>
                <th className="text-left px-4 py-2">Stock</th>
                <th className="text-left px-4 py-2">SKU</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">₹{product.price}</td>
                    <td className="px-4 py-2">{product.stock}</td>
                    <td className="px-4 py-2">{product.sku}</td>
                    <td className="px-4 py-2">
                      {product.category?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      {product.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Category Table */}
        <div className="overflow-x-auto mt-10">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="px-4 py-2">{category.id}</td>
                    <td className="px-4 py-2">{category.name}</td>
                    <td className="px-4 py-2">{category.description}</td>
                    <td className="px-4 py-2">
                      {category.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
