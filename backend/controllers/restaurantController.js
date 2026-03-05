const restaurantModel = require('../models/restaurantModel');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  try {
    const restaurants = await restaurantModel.getAll(limit, offset);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const restaurant = await restaurantModel.getById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, phone_number, opening_hours, status } = req.body;
    if (!name || !description || !phone_number || !opening_hours || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await restaurantModel.create({ name, description, phone_number, opening_hours, status });
    res.status(201).json({ message: 'Restaurant created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, phone_number, opening_hours, status } = req.body;
    if (!name || !description || !phone_number || !opening_hours || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const affected = await restaurantModel.update(req.params.id, { name, description, phone_number, opening_hours, status });
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Restaurant updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await restaurantModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
