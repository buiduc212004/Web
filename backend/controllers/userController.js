const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const formatPagination = require('../utils/pagination');
const logger = require('../config/logger');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

const register = async (req, res) => {
    try {
        const { username, email, password, fullName, phoneNumber, address } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email hoac username da ton tai' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
            address,
            role: 'customer'
        });

        await user.save();
        const token = generateToken(user);

        res.status(201).json({
            message: 'Dang ky thanh cong',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error in register:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email hoac mat khau khong dung' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoac mat khau khong dung' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Tai khoan da bi khoa' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Dang nhap thanh cong',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error in login:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        logger.error('Error in getProfile:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, address } = req.body;
        const user = await User.findById(req.user._id);

        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;

        await user.save();

        res.json({
            message: 'Cap nhat thong tin thanh cong',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                role: user.role
            }
        });
    } catch (error) {
        logger.error('Error in updateProfile:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mat khau hien tai khong dung' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Doi mat khau thanh cong' });
    } catch (error) {
        logger.error('Error in changePassword:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        let sort = {};

        if (req.query.role) {
            query.role = req.query.role;
        }

        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        if (req.query.search) {
            query.$or = [
                { username: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { fullName: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
        }

        if (req.query.sort) {
            const sortFields = req.query.sort.split(',');
            sortFields.forEach(field => {
                if (field.startsWith('-')) {
                    sort[field.substring(1)] = -1;
                } else {
                    sort[field] = 1;
                }
            });
        } else {
            sort.createdAt = -1;
        }

        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json(formatPagination(users, page, limit, total));
    } catch (error) {
        logger.error('Error in getUsers:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Khong tim thay nguoi dung' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: 'Cap nhat trang thai thanh cong',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isActive: user.isActive
            }
        });
    } catch (error) {
        logger.error('Error in updateUserStatus:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getUsers,
    updateUserStatus
}; 