const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách đơn hàng (Admin)
router.get('/', auth, role('admin'), orderController.getAll); // [GET] /api/orders
// Lấy chi tiết đơn hàng
router.get('/:id', auth, orderController.getById); // [GET] /api/orders/:id
// Thêm đơn hàng (Admin)
router.post('/', auth, role('admin'), orderController.create); // [POST] /api/orders
// Sửa đơn hàng (Admin)
router.put('/:id', auth, role('admin'), orderController.update); // [PUT] /api/orders/:id
// Xóa đơn hàng (Admin)
router.delete('/:id', auth, role('admin'), orderController.delete); // [DELETE] /api/orders/:id

module.exports = router; 