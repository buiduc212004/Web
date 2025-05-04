const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách khuyến mãi
router.get('/', promotionController.getAll); // [GET] /api/promotions
// Lấy chi tiết khuyến mãi
router.get('/:id', promotionController.getById); // [GET] /api/promotions/:id

// Admin
router.post('/', auth, role('admin'), promotionController.create); // [POST] /api/promotions
router.put('/:id', auth, role('admin'), promotionController.update); // [PUT] /api/promotions/:id
router.delete('/:id', auth, role('admin'), promotionController.delete); // [DELETE] /api/promotions/:id

module.exports = router; 