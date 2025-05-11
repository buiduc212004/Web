const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadImage, deleteImage, getImagesByReference, getMainImage } = require('../controllers/uploadController');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất bằng timestamp và tên gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Route upload ảnh
router.post('/', upload.single('image'), uploadImage);

// Route lấy danh sách ảnh theo loại và ID tham chiếu
router.get('/reference/:referenceType/:referenceId', getImagesByReference);

// Route lấy ảnh chính theo loại và ID tham chiếu
router.get('/main/:referenceType/:referenceId', getMainImage);

// Route xóa ảnh
router.delete('/:id', deleteImage);

module.exports = router; 