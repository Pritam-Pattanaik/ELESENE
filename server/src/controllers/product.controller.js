const { Product, ProductVariant, ProductImage, Category, Review } = require('../models');
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
      sort = 'newest' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build filter query
    let whereClause = { is_active: true };

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
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
        { model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary', 'alt_text'] }
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

// @desc    Get single product by slug
// @route   GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, is_active: true },
      include: [
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: Category, attributes: ['name', 'slug'] },
        { model: Review, attributes: ['rating', 'title', 'body', 'created_at'] }
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
        { model: ProductImage, as: 'images', attributes: ['image_url', 'is_primary'] }
      ],
      limit: 10
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getTrendingProducts
};
