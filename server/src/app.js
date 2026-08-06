const express = require('express');
const corsMiddleware = require('./middleware/cors.middleware');
const helmet = require('helmet');
const path = require('path');
require('./config/env');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');
const loyaltyRoutes = require('./routes/loyalty.routes');

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoints
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    message: 'ELESENE API is running...',
    timestamp: new Date().toISOString()
  });
};

app.get('/', healthHandler);
app.get('/api', healthHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// 500 Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
