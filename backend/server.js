const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');
const promotionRoutes = require('./routes/promotion');
const restaurantRoutes = require('./routes/restaurant');
const logger = require('./config/logger');
// Thêm các route khác nếu có

const app = express();

app.use(cors());
app.use(express.json());

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
// Thêm các route khác nếu có

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 