const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');
const promotionRoutes = require('./routes/promotion');
const restaurantRoutes = require('./routes/restaurant');
const uploadRoutes = require('./routes/upload');
const logger = require('./config/logger');
// Thêm các route khác nếu có

const app = express();

// Cấu hình CORS
app.use(cors());

// Cấu hình middleware để parse JSON
app.use(express.json({ 
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Cấu hình middleware để parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Cấu hình static file serving cho thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/upload', uploadRoutes);
// Thêm các route khác nếu có

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 