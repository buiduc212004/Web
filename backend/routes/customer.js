const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

// Lấy danh sách khách hàng (Admin)
router.get('/', auth, role('admin'), customerController.getAll); // [GET] /api/customers
// Xóa khách hàng (Admin)
router.delete('/:id', auth, role('admin'), customerController.delete); // [DELETE] /api/customers/:id

// User: xem/sửa thông tin cá nhân
router.get('/:id', auth, customerController.getById); // [GET] /api/customers/:id
router.put('/:id', auth, customerController.update); // [PUT] /api/customers/:id

module.exports = router; 