const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const Promotion = require('../models/Promotion');

// Public routes
router.post('/validate', promotionController.validatePromotion);

// Admin routes (user must be admin)
router.post('/', verifyToken, isAdmin, promotionController.createPromotion);
router.get('/', verifyToken, isAdmin, promotionController.getAllPromotions);
router.get('/:id', verifyToken, isAdmin, promotionController.getPromotionById);
router.patch('/:id', verifyToken, isAdmin, promotionController.updatePromotion);
router.delete('/:id', verifyToken, isAdmin, promotionController.deletePromotion);

module.exports = router; 