const express = require('express');
const router = express.Router();
const categoryModel = require('../models/categoryModel');

// Lấy tất cả categories có phân trang
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const { data, total } = await categoryModel.getAllCategories(page, limit);
    res.json({ categories: data, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm category mới
router.post('/', async (req, res) => {
  try {
    const { name, description, status, products } = req.body;
    const newCategory = await categoryModel.createCategory(name, description, status, products);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xoá category theo id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const deleted = await categoryModel.deleteCategory(id);
    if (deleted) {
      res.json({ message: 'Category deleted' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật category theo id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const { name, description, status, products } = req.body;
    const updated = await categoryModel.updateCategory(id, name, description, status, products);
    if (updated) {
      res.json({ message: 'Category updated' });
    } else {
      res.status(404).json({ error: 'Category not found or not updated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 