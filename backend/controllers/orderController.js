const Order = require('../models/Order');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const formatPagination = require('../utils/pagination');

const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod, notes, promotionCode } = req.body;
        
        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.product} not found` });
            }
            totalAmount += product.price * item.quantity;
        }

        // Apply promotion if provided
        let discount = 0;
        if (promotionCode) {
            const promotion = await Promotion.findOne({
                code: promotionCode,
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (promotion) {
                if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
                    return res.status(400).json({ error: 'Promotion code has reached its usage limit' });
                }

                if (totalAmount >= promotion.minOrderAmount) {
                    if (promotion.discountType === 'percentage') {
                        discount = (totalAmount * promotion.discountValue) / 100;
                        if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                            discount = promotion.maxDiscount;
                        }
                    } else {
                        discount = promotion.discountValue;
                    }

                    promotion.usedCount += 1;
                    await promotion.save();
                }
            }
        }

        const order = new Order({
            user: req.user._id,
            items,
            totalAmount: totalAmount - discount,
            deliveryAddress,
            paymentMethod,
            notes,
            discount
        });

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        let sort = {};

        // Filter by user (for non-admin users)
        if (req.user.role !== 'admin') {
            query.user = req.user._id;
        }

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
        }

        // Filter by total amount range
        if (req.query.minTotal || req.query.maxTotal) {
            query.totalAmount = {};
            if (req.query.minTotal) query.totalAmount.$gte = parseInt(req.query.minTotal);
            if (req.query.maxTotal) query.totalAmount.$lte = parseInt(req.query.maxTotal);
        }

        // Search by order ID or user info
        if (req.query.search) {
            query.$or = [
                { _id: req.query.search },
                { 'user.username': { $regex: req.query.search, $options: 'i' } },
                { 'user.email': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sorting
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
            sort.createdAt = -1; // Default sort by newest
        }

        // Execute query
        const orders = await Order.find(query)
            .populate('user', 'username email')
            .populate('items.product')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        res.json(formatPagination(orders, page, limit, total));
    } catch (error) {
        logger.error('Error getting orders:', error);
        res.status(500).json({ message: 'Error getting orders' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email')
            .populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot cancel order in current status' });
        }

        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
}; 