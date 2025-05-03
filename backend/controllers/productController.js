const Product = require('../models/Product');
const Category = require('../models/Category');
const formatPagination = require('../utils/pagination');

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .skip(req.pagination.startIndex)
            .limit(req.pagination.limit);

        res.json({
            ...req.pagination.results,
            products
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('reviews.user', 'username');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'price', 'category', 'image', 'isAvailable', 'ingredients', 'preparationTime'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        updates.forEach(update => product[update] = req.body[update]);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const review = {
            user: req.user._id,
            rating,
            comment
        };

        product.reviews.push(review);
        await product.save();

        // Update product rating
        const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        product.rating = totalRating / product.reviews.length;
        await product.save();

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        let sort = {};

        // Filter by category
        if (req.query.category) {
            const category = await Category.findOne({ name: req.query.category });
            if (category) {
                query.category = category._id;
            }
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
        }

        // Filter by availability
        if (req.query.isAvailable !== undefined) {
            query.isAvailable = req.query.isAvailable === 'true';
        }

        // Search by name or description
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by rating
        if (req.query.minRating) {
            query.rating = { $gte: parseFloat(req.query.minRating) };
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
        const products = await Product.find(query)
            .populate('category')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        res.json(formatPagination(products, page, limit, total));
    } catch (error) {
        logger.error('Error getting products:', error);
        res.status(500).json({ message: 'Error getting products' });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addReview,
    getProducts
}; 