const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Vui long dang nhap' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Token khong hop le' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Tai khoan da bi khoa' });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Error verifying token:', error);
        res.status(401).json({ message: 'Token khong hop le' });
    }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Khong co quyen truy cap' });
    }
    next();
};

// Middleware to check customer role
const isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Khong co quyen truy cap' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isCustomer }; 