const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');

// Protected routes (user must be logged in)
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.post('/:id/cancel', verifyToken, orderController.cancelOrder);

// Admin routes (user must be admin)
router.patch('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router; 