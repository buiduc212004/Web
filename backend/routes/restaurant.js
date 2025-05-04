const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách nhà hàng
router.get('/', restaurantController.getAll); // [GET] /api/restaurants
// Lấy chi tiết nhà hàng
router.get('/:id', restaurantController.getById); // [GET] /api/restaurants/:id

// Admin
router.post('/', auth, role('admin'), restaurantController.create); // [POST] /api/restaurants
router.put('/:id', auth, role('admin'), restaurantController.update); // [PUT] /api/restaurants/:id
router.delete('/:id', auth, role('admin'), restaurantController.delete); // [DELETE] /api/restaurants/:id

module.exports = router; 