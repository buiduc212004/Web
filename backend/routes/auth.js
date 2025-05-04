const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký tài khoản
router.post('/register', authController.register); // [POST] /api/auth/register
// Đăng nhập
router.post('/login', authController.login); // [POST] /api/auth/login

module.exports = router; 