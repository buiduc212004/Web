const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');

// Đảm bảo thư mục uploads tồn tại
const ensureUploadsDirectory = async () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
        await fs.access(uploadsDir);
        logger.info('[UPLOAD] Uploads directory exists');
    } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
        logger.info('[UPLOAD] Created uploads directory');
    }
};

// Xử lý upload ảnh
const uploadImage = async (req, res) => {
    try {
        logger.info('[UPLOAD] ====== Starting new image upload ======');
        await ensureUploadsDirectory();

        if (!req.file) {
            logger.error('[UPLOAD] No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Log thông tin file
        logger.info('[UPLOAD] File details:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.size / 1024).toFixed(2)} KB`
        });

        // Tạo URL cho ảnh đã upload
        const imageUrl = `/uploads/${req.file.filename}`;
        logger.info('[UPLOAD] Image URL:', imageUrl);

        // Log đường dẫn đầy đủ của file
        const fullPath = path.join(__dirname, '../uploads', req.file.filename);
        logger.info('[UPLOAD] Full file path:', fullPath);

        // Kiểm tra file đã tồn tại
        try {
            await fs.access(fullPath);
            logger.info('[UPLOAD] File successfully saved to disk');
        } catch (error) {
            logger.error('[UPLOAD] File not found after upload:', error);
            throw new Error('File not found after upload');
        }

        logger.info('[UPLOAD] ====== Image upload completed successfully ======');
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: imageUrl
            }
        });
    } catch (error) {
        logger.error('[UPLOAD] Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};

// Xóa ảnh
const deleteImage = async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, '../uploads', filename);
        
        logger.info('[UPLOAD] Attempting to delete file:', filename);
        
        await fs.unlink(filepath);
        logger.info('[UPLOAD] File deleted successfully:', filename);
        
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        logger.error('[UPLOAD] Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
};

module.exports = {
    uploadImage,
    deleteImage
}; 