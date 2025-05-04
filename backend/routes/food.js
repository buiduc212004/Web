const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách món ăn
router.get('/', foodController.getAll); // [GET] /api/foods
// Lấy chi tiết món ăn
router.get('/:id', foodController.getById); // [GET] /api/foods/:id

// Admin
router.post('/', auth, role('admin'), foodController.create); // [POST] /api/foods
router.put('/:id', auth, role('admin'), foodController.update); // [PUT] /api/foods/:id
router.delete('/:id', auth, role('admin'), foodController.delete); // [DELETE] /api/foods/:id

module.exports = router; 