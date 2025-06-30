import React, { useState, useEffect } from 'react';

export const AddProducts = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    isActive: true,
    categoryId: ''
  });

  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories on component load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/categories');
        const data = await res.json();
        setCategories(data.data.categories);  // assumes backend sends an array of categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      if (res.ok) {
        const data = await res.json();
        alert('Product added successfully!');
        console.log(data);

        // Reset form
        setProduct({
          name: '',
          description: '',
          price: '',
          stock: '',
          sku: '',
          isActive: true,
          categoryId: ''
        });
      } else {
        console.error('Failed to add product');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={product.stock}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={product.sku}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* ✅ Category Dropdown */}
        <select
          name="categoryId"
          value={product.categoryId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={product.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};
