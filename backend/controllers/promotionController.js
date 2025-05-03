const Promotion = require('../models/Promotion');

const createPromotion = async (req, res) => {
    try {
        const promotion = new Promotion(req.body);
        await promotion.save();
        res.status(201).json(promotion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllPromotions = async (req, res) => {
    try {
        const { isActive, startDate, endDate } = req.query;
        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        if (startDate) {
            query.startDate = { $gte: new Date(startDate) };
        }

        if (endDate) {
            query.endDate = { $lte: new Date(endDate) };
        }

        const promotions = await Promotion.find(query)
            .populate('applicableProducts', 'name')
            .populate('applicableCategories', 'name')
            .sort({ startDate: -1 })
            .skip(req.pagination.startIndex)
            .limit(req.pagination.limit);

        res.json({
            ...req.pagination.results,
            promotions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
            .populate('applicableProducts', 'name')
            .populate('applicableCategories', 'name');

        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        res.json(promotion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updatePromotion = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'name',
        'description',
        'discountType',
        'discountValue',
        'startDate',
        'endDate',
        'minOrderAmount',
        'maxDiscount',
        'code',
        'isActive',
        'usageLimit',
        'applicableProducts',
        'applicableCategories'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        updates.forEach(update => promotion[update] = req.body[update]);
        await promotion.save();
        res.json(promotion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }
        res.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const validatePromotion = async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        const promotion = await Promotion.findOne({
            code,
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        if (!promotion) {
            return res.status(404).json({ error: 'Invalid or expired promotion code' });
        }

        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return res.status(400).json({ error: 'Promotion code has reached its usage limit' });
        }

        if (totalAmount < promotion.minOrderAmount) {
            return res.status(400).json({ 
                error: `Minimum order amount of ${promotion.minOrderAmount} required for this promotion` 
            });
        }

        let discount = 0;
        if (promotion.discountType === 'percentage') {
            discount = (totalAmount * promotion.discountValue) / 100;
            if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                discount = promotion.maxDiscount;
            }
        } else {
            discount = promotion.discountValue;
        }

        res.json({
            promotion,
            discount,
            finalAmount: totalAmount - discount
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    validatePromotion
}; 