import React, { useState } from 'react';

export const AddCategory = () => {
  const [category, setCategory] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCategory((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (res.ok) {
        const data = await res.json();
        alert('Category added successfully!');
        console.log(data);

        // Reset form
        setCategory({
          name: '',
          description: '',
          isActive: true,
        });
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={category.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={category.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={category.isActive}
            onChange={handleChange}
          />
          <label className="text-sm">Active</label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Category
        </button>
      </form>
    </div>
  );
};
