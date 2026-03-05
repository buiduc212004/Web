const path = require('path');
const fs = require('fs').promises;
const logger = require('../config/logger');
const imageModel = require('../models/imageModel');

const ensureUploadsDirectory = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    logger.info('[UPLOAD] Created uploads directory');
  }
};

const uploadImage = async (req, res) => {
  try {
    logger.info('[UPLOAD] ====== Starting new image upload ======');
    await ensureUploadsDirectory();

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', error: 'No file in request. Kiểm tra key form-data phải là image.' });
    }

    const { referenceType, referenceId } = req.body;
    if (!referenceType || !referenceId) {
      return res.status(400).json({ message: 'Missing information', error: 'referenceType and referenceId are required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const fullPath = path.join(__dirname, '../uploads', req.file.filename);

    try {
      await fs.access(fullPath);
    } catch {
      throw new Error('File not found after upload');
    }

    const isMain = req.body.isMain === 'true' || req.body.isMain === '1' ? 1 : 0;

    if (isMain) {
      await imageModel.setOthersNotMain(referenceType, referenceId);
    }

    const imageId = await imageModel.save({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: imageUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      referenceType,
      referenceId,
      isMain,
    });

    logger.info('[UPLOAD] ====== Image upload completed successfully ======');
    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        id: imageId,
        filename: req.file.filename,
        path: imageUrl,
        referenceType,
        referenceId,
        isMain: !!isMain,
      },
    });
  } catch (error) {
    logger.error('[UPLOAD] Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

const getImagesByReference = async (req, res) => {
  try {
    const { referenceType, referenceId } = req.params;
    const images = await imageModel.findByReference(referenceType, referenceId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(200).json(images.map(img => ({ ...img, fullPath: `${baseUrl}${img.path}` })));
  } catch (error) {
    logger.error('[IMAGES] Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

const getMainImage = async (req, res) => {
  try {
    const { referenceType, referenceId } = req.params;
    const image = await imageModel.findMainByReference(referenceType, referenceId);
    if (!image) return res.status(404).json({ message: 'No image found' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(200).json({ ...image, fullPath: `${baseUrl}${image.path}` });
  } catch (error) {
    logger.error('[IMAGES] Error fetching main image:', error);
    res.status(500).json({ message: 'Error fetching main image', error: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await imageModel.findById(imageId);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const filepath = path.join(__dirname, '..', image.path);
    try {
      await fs.unlink(filepath);
    } catch {
      logger.error(`[UPLOAD] File not found on disk: ${filepath}`);
    }

    await imageModel.delete(imageId);
    res.status(200).json({ message: 'Image deleted successfully', id: imageId });
  } catch (error) {
    logger.error('[UPLOAD] Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};

module.exports = { uploadImage, deleteImage, getImagesByReference, getMainImage };
