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
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const helmet = require('helmet');
const compression = require('compression');
const categoryRoutes = require('./routes/categoryRoutes');
// Thêm các route khác nếu có

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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

app.use(helmet());
app.use(compression());

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
app.use('/api/categories', categoryRoutes);
// Thêm các route khác nếu có

// WebSocket connection handling
io.on('connection', (socket) => {
    logger.info('New client connected');

    // Xác thực socket connection
    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            socket.join(decoded.role); // Join room based on role
            logger.info(`User ${decoded.id} authenticated`);
        } catch (error) {
            logger.error('Socket authentication error:', error);
            socket.disconnect();
        }
    });

    // Xử lý đơn hàng mới
    socket.on('new_order', (order) => {
        logger.info('New order received:', order);
        io.to('admin').emit('order_notification', {
            type: 'new_order',
            order: order
        });
    });

    // Xử lý cập nhật trạng thái đơn hàng
    socket.on('order_status_update', (data) => {
        logger.info('Order status update:', data);
        io.to('admin').emit('order_update', data);
        io.to(data.userId).emit('order_status_changed', data);
    });

    // Xử lý chat giữa admin và user
    socket.on('chat_message', (message) => {
        logger.info('Chat message:', message);
        if (socket.userRole === 'admin') {
            io.to(message.userId).emit('admin_message', message);
        } else {
            io.to('admin').emit('user_message', {
                ...message,
                userId: socket.userId
            });
        }
    });

    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; 