const orderModel = require('../models/orderModel');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  try {
    const orders = await orderModel.getAll(limit, offset);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await orderModel.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time } = req.body;
    if (!id_KH || !id_NH || !category || total_price == null || !order_status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const now = new Date();
    const currentDate = date || now.toISOString().split('T')[0];
    const currentTime = time || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    await orderModel.create({ id_KH, id_NH, id_PROMO, category, total_price, order_status, date: currentDate, time: currentTime });
    res.status(201).json({ message: 'Order added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id_KH, id_NH, id_PROMO, category, total_price, order_status, date, time } = req.body;
    if (!id_KH || !id_NH || !category || total_price == null || !order_status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const now = new Date();
    const currentDate = date || now.toISOString().split('T')[0];
    const currentTime = time || `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const affected = await orderModel.update(req.params.id, { id_KH, id_NH, id_PROMO, category, total_price, order_status, date: currentDate, time: currentTime });
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await orderModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
