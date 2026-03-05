const customerModel = require('../models/customerModel');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const offset = (page - 1) * limit;
  try {
    const customers = await customerModel.getAll(limit, offset);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await customerModel.getById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, phone_number, address } = req.body;
    if (!name || !phone_number || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const affected = await customerModel.update(req.params.id, { name, phone_number, address });
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await customerModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
