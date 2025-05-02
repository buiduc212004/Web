const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  badge: {
    type: String,
    enum: ['Top Seller', 'New', 'Special', null],
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 