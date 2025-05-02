const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

// Get all promotions
router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single promotion
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create promotion
router.post('/', async (req, res) => {
  const promotion = new Promotion(req.body);
  try {
    const newPromotion = await promotion.save();
    res.status(201).json(newPromotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update promotion
router.put('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    Object.assign(promotion, req.body);
    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }
    await promotion.remove();
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 