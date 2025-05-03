const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isCustomer } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/change-password', verifyToken, userController.changePassword);

// Admin only routes
router.get('/', verifyToken, isAdmin, userController.getUsers);
router.put('/:id/status', verifyToken, isAdmin, userController.updateUserStatus);

module.exports = router; 