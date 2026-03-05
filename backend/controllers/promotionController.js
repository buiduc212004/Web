const promotionModel = require('../models/promotionModel');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  const { status, search, fromDate, toDate } = req.query;
  try {
    const data = await promotionModel.getAll(limit, offset, { status, search, fromDate, toDate });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const promotion = await promotionModel.getById(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'Not found' });
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate } = req.body;
    if (!name || discount_percentage == null || min_order_value == null || max_discount_amount == null || !status || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const promotion = await promotionModel.create({ name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate });
    res.status(201).json(promotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate } = req.body;
    if (!name || discount_percentage == null || min_order_value == null || max_discount_amount == null || !status || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const affected = await promotionModel.update(req.params.id, { name, discount_percentage, min_order_value, max_discount_amount, status, startDate, endDate });
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Promotion updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await promotionModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
