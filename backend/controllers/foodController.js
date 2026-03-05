const foodModel = require('../models/foodModel');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  const { search = '', category = '', type = '' } = req.query;
  try {
    const data = await foodModel.getAll(limit, offset, search, category, type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id. Id must be a positive integer.' });
  }
  try {
    const food = await foodModel.getById(id);
    if (!food) return res.status(404).json({ error: 'Not found' });
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, category, status, type, image_id, sold_quantity } = req.body;
    if (!name || price == null || !category || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await foodModel.create({ name, description, price, category, status, type, image_id, sold_quantity });
    res.status(201).json({ message: 'Food created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, price, category, status, type, image_id, sold_quantity } = req.body;
    if (!name || price == null || !category || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const affected = await foodModel.update(req.params.id, { name, description, price, category, status, type, image_id, sold_quantity });
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Food updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await foodModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Food deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const products = await foodModel.getTopProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
