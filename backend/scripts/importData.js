const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');

// Read JSON files
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/categories.json'), 'utf8'));
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));
const promotionsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/promotions.json'), 'utf8'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Import data
async function importData() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Promotion.deleteMany({});

        // Hash passwords for users
        const hashedUsersData = await Promise.all(usersData.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return {
                ...user,
                password: hashedPassword
            };
        }));

        // Import users
        const users = await User.insertMany(hashedUsersData);
        console.log('Users imported successfully');

        // Import categories
        const categories = await Category.insertMany(categoriesData);
        console.log('Categories imported successfully');

        // Update products with category IDs
        const updatedProductsData = productsData.map(product => {
            const category = categories.find(cat => cat.name === product.category);
            return {
                ...product,
                category: category._id
            };
        });

        // Import products
        const products = await Product.insertMany(updatedProductsData);
        console.log('Products imported successfully');

        // Import promotions
        const promotions = await Promotion.insertMany(promotionsData);
        console.log('Promotions imported successfully');

        console.log('All data imported successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}

importData(); 