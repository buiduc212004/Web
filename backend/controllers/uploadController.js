const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');
const sql = require('mssql');
const db = require('../config/db');

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
            return res.status(400).json({ message: 'No file uploaded', error: 'No file in request. Kiểm tra key form-data phải là image.' });
        }

        // Lấy thông tin liên kết từ form-data
        const { referenceType, referenceId } = req.body;
        
        if (!referenceType || !referenceId) {
            logger.error('[UPLOAD] Missing referenceType or referenceId');
            return res.status(400).json({ 
                message: 'Missing information', 
                error: 'referenceType and referenceId are required' 
            });
        }

        // Log thông tin file
        logger.info('[UPLOAD] File details:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.size / 1024).toFixed(2)} KB`,
            referenceType,
            referenceId
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

        // Lưu thông tin file vào database
        const pool = await sql.connect(db.config);
        
        // Kiểm tra nếu đánh dấu ảnh này là ảnh chính
        const isMain = req.body.isMain === 'true' || req.body.isMain === '1' ? 1 : 0;
        
        // Nếu là ảnh chính, cập nhật các ảnh khác không phải là ảnh chính
        if (isMain) {
            await pool.request()
                .input('referenceType', sql.VarChar(50), referenceType)
                .input('referenceId', sql.Int, referenceId)
                .query(`UPDATE dbo.Images 
                       SET is_main = 0 
                       WHERE referenceType = @referenceType AND referenceId = @referenceId`);
        }
        
        // Chèn thông tin ảnh vào bảng Images
        const result = await pool.request()
            .input('filename', sql.VarChar(255), req.file.filename)
            .input('originalname', sql.VarChar(255), req.file.originalname)
            .input('path', sql.VarChar(500), imageUrl)
            .input('mimetype', sql.VarChar(100), req.file.mimetype)
            .input('size', sql.Int, req.file.size)
            .input('referenceType', sql.VarChar(50), referenceType)
            .input('referenceId', sql.Int, referenceId)
            .input('isMain', sql.Bit, isMain)
            .query(`
                INSERT INTO dbo.Images (filename, originalname, path, mimetype, size, referenceType, referenceId, uploadDate, is_main)
                VALUES (@filename, @originalname, @path, @mimetype, @size, @referenceType, @referenceId, GETDATE(), @isMain);
                SELECT SCOPE_IDENTITY() AS id;
            `);
        
        const imageId = result.recordset[0].id;

        logger.info('[UPLOAD] ====== Image upload completed successfully and saved to database ======');
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                id: imageId,
                filename: req.file.filename,
                path: imageUrl,
                referenceType,
                referenceId,
                isMain: !!isMain
            }
        });
    } catch (error) {
        logger.error('[UPLOAD] Error uploading file:', error);
        // Trả về lỗi chi tiết hơn cho client
        res.status(500).json({ message: 'Error uploading file', error: error.message, stack: error.stack });
    }
};

// Lấy danh sách ảnh theo loại và ID tham chiếu
const getImagesByReference = async (req, res) => {
    try {
        const { referenceType, referenceId } = req.params;
        logger.info(`[IMAGES] Fetching images for ${referenceType} with ID ${referenceId}`);
        
        const pool = await sql.connect(db.config);
        const result = await pool.request()
            .input('referenceType', sql.VarChar(50), referenceType)
            .input('referenceId', sql.Int, referenceId)
            .query(`
                SELECT * FROM dbo.Images 
                WHERE referenceType = @referenceType AND referenceId = @referenceId
                ORDER BY is_main DESC, uploadDate DESC
            `);
        
        // Thêm URL đầy đủ cho tất cả ảnh
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const images = result.recordset.map(img => ({
            ...img,
            fullPath: `${baseUrl}${img.path}`
        }));
        
        logger.info(`[IMAGES] Found ${images.length} images`);
        res.status(200).json(images);
    } catch (error) {
        logger.error('[IMAGES] Error fetching images:', error);
        res.status(500).json({ message: 'Error fetching images', error: error.message });
    }
};

// Lấy ảnh chính theo loại và ID tham chiếu
const getMainImage = async (req, res) => {
    try {
        const { referenceType, referenceId } = req.params;
        logger.info(`[IMAGES] Fetching main image for ${referenceType} with ID ${referenceId}`);
        
        const pool = await sql.connect(db.config);
        const result = await pool.request()
            .input('referenceType', sql.VarChar(50), referenceType)
            .input('referenceId', sql.Int, referenceId)
            .query(`
                SELECT TOP 1 * FROM dbo.Images 
                WHERE referenceType = @referenceType AND referenceId = @referenceId AND is_main = 1
                ORDER BY uploadDate DESC
            `);
        
        if (result.recordset.length === 0) {
            // Nếu không có ảnh chính, lấy ảnh đầu tiên
            const fallbackResult = await pool.request()
                .input('referenceType', sql.VarChar(50), referenceType)
                .input('referenceId', sql.Int, referenceId)
                .query(`
                    SELECT TOP 1 * FROM dbo.Images 
                    WHERE referenceType = @referenceType AND referenceId = @referenceId
                    ORDER BY uploadDate DESC
                `);
                
            if (fallbackResult.recordset.length === 0) {
                return res.status(404).json({ message: 'No image found' });
            }
            
            const image = fallbackResult.recordset[0];
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            image.fullPath = `${baseUrl}${image.path}`;
            
            logger.info(`[IMAGES] Returning fallback image`);
            return res.status(200).json(image);
        }
        
        const image = result.recordset[0];
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        image.fullPath = `${baseUrl}${image.path}`;
        
        logger.info(`[IMAGES] Returning main image`);
        res.status(200).json(image);
    } catch (error) {
        logger.error('[IMAGES] Error fetching main image:', error);
        res.status(500).json({ message: 'Error fetching main image', error: error.message });
    }
};

// Xóa ảnh
const deleteImage = async (req, res) => {
    try {
        const imageId = req.params.id;
        logger.info(`[UPLOAD] Attempting to delete image with ID: ${imageId}`);
        
        // Lấy thông tin ảnh từ database
        const pool = await sql.connect(db.config);
        const result = await pool.request()
            .input('id', sql.Int, imageId)
            .query('SELECT * FROM dbo.Images WHERE id = @id');
        
        if (result.recordset.length === 0) {
            logger.error(`[UPLOAD] Image with ID ${imageId} not found`);
            return res.status(404).json({ message: 'Image not found' });
        }
        
        const image = result.recordset[0];
        const filepath = path.join(__dirname, '..', image.path);
        
        // Xóa file từ hệ thống file
        try {
            await fs.unlink(filepath);
            logger.info(`[UPLOAD] File deleted from disk: ${filepath}`);
        } catch (error) {
            logger.error(`[UPLOAD] Error deleting file from disk: ${error.message}`);
            // Tiếp tục xóa từ database ngay cả khi file không tồn tại trên disk
        }
        
        // Xóa record từ database
        await pool.request()
            .input('id', sql.Int, imageId)
            .query('DELETE FROM dbo.Images WHERE id = @id');
        
        logger.info(`[UPLOAD] Image with ID ${imageId} deleted from database`);
        res.status(200).json({ message: 'Image deleted successfully', id: imageId });
    } catch (error) {
        logger.error('[UPLOAD] Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image', error: error.message });
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    getImagesByReference,
    getMainImage
}; 