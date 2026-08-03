const { Product, ProductVariant, ProductImage, Category, Review, Order, OrderItem, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all products (with filtering, sorting, pagination)
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      is_featured,
      sort = 'newest' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build filter query
    let whereClause = { is_active: true };

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (is_featured === 'true') {
      whereClause.is_featured = true;
    }

    if (minPrice || maxPrice) {
      whereClause.base_price = {};
      if (minPrice) whereClause.base_price[Op.gte] = minPrice;
      if (maxPrice) whereClause.base_price[Op.lte] = maxPrice;
    }

    if (category) {
      // Find category ID by slug
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) {
        whereClause.category_id = cat.id;
      }
    }

    // Build sort
    let orderClause = [['created_at', 'DESC']]; // default newest
    if (sort === 'price_asc') orderClause = [['base_price', 'ASC']];
    if (sort === 'price_desc') orderClause = [['base_price', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary', 'alt_text'] },
        { model: ProductVariant, as: 'variants' }
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true, // required when including associations with limits
    });

    res.json({
      success: true,
      products: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug or id
// @route   GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const param = req.params.slug || req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);

    const product = await Product.findOne({
      where: {
        is_active: true,
        ...(isUuid ? { [Op.or]: [{ id: param }, { slug: param }] } : { slug: param })
      },
      include: [
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: Category, attributes: ['name', 'slug'] },
        { 
          model: Review, 
          attributes: ['id', 'rating', 'title', 'body', 'is_verified_purchase', 'created_at'],
          include: [{ model: User, attributes: ['id', 'full_name'] }]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_trending: true, is_active: true },
      include: [
        { model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary'] },
        { model: ProductVariant, as: 'variants' }
      ],
      limit: 10
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const productId = req.params.id;

    const numRating = Number(rating);
    if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Review body cannot be empty' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check one review per user per product
    const existingReview = await Review.findOne({
      where: { user_id: req.user.id, product_id: productId }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product' });
    }

    // Check if this is a verified purchase
    const purchased = await Order.findOne({
      where: { user_id: req.user.id, payment_status: 'paid' },
      include: [{
        model: OrderItem,
        where: { product_id: productId }
      }]
    });

    const is_verified_purchase = !!purchased;

    const review = await Review.create({
      user_id: req.user.id,
      product_id: productId,
      rating: numRating,
      title: title ? title.trim() : null,
      body: body.trim(),
      is_verified_purchase,
      is_approved: true
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      attributes: ['id', 'rating', 'title', 'body', 'is_verified_purchase', 'created_at'],
      include: [{ model: User, attributes: ['id', 'full_name'] }]
    });

    res.status(201).json({ success: true, review: reviewWithUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getTrendingProducts,
  createProductReview
};
