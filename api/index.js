const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { sequelize } = require('../server/src/models');
const authRoutes = require('../server/src/routes/auth.routes');
const productRoutes = require('../server/src/routes/product.routes');
const categoryRoutes = require('../server/src/routes/category.routes');
const adminRoutes = require('../server/src/routes/admin.routes');
const cartRoutes = require('../server/src/routes/cart.routes');
const orderRoutes = require('../server/src/routes/order.routes');
const userRoutes = require('../server/src/routes/user.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

// Root health check
app.get('/api', (req, res) => {
  res.json({ message: 'ELESENE API is running...' });
});

// Connect to DB then export
sequelize.sync({ alter: false }).catch(err => {
  console.error('DB sync error:', err.message);
});

module.exports = app;
