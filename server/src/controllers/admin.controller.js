const { Product, Category, ProductVariant, ProductImage, Order, OrderItem, User, Coupon, Address, Review } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/db');
const loyaltyService = require('../services/loyalty.service');

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Run all queries in parallel — they are fully independent
    const [
      revenueResult,
      totalOrders,
      totalCustomers,
      activeProducts,
      pendingOrders,
      lowStockProducts,
      returnRequests,
      recentOrders,
      topProducts,
      monthlyRevenue,
      categorySalesBreakdown,
    ] = await Promise.all([
      // Total revenue (paid orders only)
      Order.findOne({
        attributes: [[fn('COALESCE', fn('SUM', col('total_amount')), 0), 'totalRevenue']],
        where: { payment_status: 'paid' },
        raw: true,
      }),
      // Total orders
      Order.count(),
      // Total customers
      User.count({ where: { role: 'customer' } }),
      // Active products
      Product.count({ where: { is_active: true } }),
      // Pending orders
      Order.count({ where: { status: 'pending' } }),
      // Low stock products
      ProductVariant.count({ where: { stock_quantity: { [Op.lt]: 5 } } }),
      // Return requests
      Order.count({ where: { status: 'returned' } }),
      // Recent orders
      Order.findAll({
        include: [{ model: User, attributes: ['full_name', 'email'] }],
        order: [['created_at', 'DESC']],
        limit: 10,
      }),
      // Top products by order count
      OrderItem.findAll({
        attributes: [
          'product_id',
          [fn('SUM', col('quantity')), 'total_sold'],
          [fn('SUM', col('total_price')), 'total_revenue'],
        ],
        include: [{ model: Product, attributes: ['name', 'slug', 'base_price'] }],
        group: ['product_id', 'Product.id'],
        order: [[fn('SUM', col('quantity')), 'DESC']],
        limit: 5,
        raw: false,
      }),
      // Monthly revenue (last 6 months)
      Order.findAll({
        attributes: [
          [fn('date_trunc', 'month', col('created_at')), 'month'],
          [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'revenue'],
          [fn('COUNT', col('id')), 'order_count'],
        ],
        where: {
          payment_status: 'paid',
          created_at: { [Op.gte]: sixMonthsAgo },
        },
        group: [fn('date_trunc', 'month', col('created_at'))],
        order: [[fn('date_trunc', 'month', col('created_at')), 'ASC']],
        raw: true,
      }),
      // Category sales breakdown
      OrderItem.findAll({
        attributes: [
          [col('Product.Category.name'), 'category_name'],
          [fn('SUM', col('quantity')), 'sales_count'],
        ],
        include: [{
          model: Product,
          attributes: [],
          include: [{ model: Category, attributes: [] }]
        }],
        group: [col('Product.Category.name')],
        order: [[fn('SUM', col('quantity')), 'DESC']],
        raw: true,
      }),
    ]);

    res.json({
      success: true,
      dashboard: {
        totalRevenue: parseFloat(revenueResult.totalRevenue) || 0,
        totalOrders,
        totalCustomers,
        activeProducts,
        pendingOrders,
        lowStockProducts,
        returnRequests,
        recentOrders,
        topProducts,
        monthlyRevenue,
        categorySalesBreakdown: categorySalesBreakdown.map(item => ({
          label: item.category_name || 'Uncategorized',
          value: parseInt(item.sales_count) || 0
        }))
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════

// @desc    Create a product
// @route   POST /api/admin/products
const createProduct = async (req, res) => {
  try {
    const { name, slug, description, base_price, price, sale_price, category_id, sku, brand, material, care_instructions, is_featured, is_trending, tags, meta_title, meta_description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const finalBasePrice = base_price !== undefined ? parseFloat(base_price) : (price !== undefined ? parseFloat(price) : 0);
    const finalSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalSku = (sku && sku.trim()) ? sku.trim() : `SKU-${Date.now()}`;

    const product = await Product.create({
      name,
      slug: finalSlug,
      description: description || '',
      base_price: finalBasePrice,
      sale_price: sale_price ? parseFloat(sale_price) : null,
      category_id: category_id || null,
      sku: finalSku,
      brand: brand || 'ELESENE',
      material: material || null,
      care_instructions: care_instructions || null,
      is_featured: !!is_featured,
      is_trending: !!is_trending,
      tags: tags || [],
      meta_title: meta_title || name,
      meta_description: meta_description || description || ''
    });

    // Automatically create ProductImage records if image_url or images provided
    const { image_url, images } = req.body;
    const imageList = [];
    if (images && Array.isArray(images)) {
      images.forEach(img => {
        const url = typeof img === 'string' ? img : img.image_url;
        if (url && url.trim()) imageList.push(url.trim());
      });
    } else if (image_url && typeof image_url === 'string' && image_url.trim()) {
      imageList.push(image_url.trim());
    }

    if (imageList.length > 0) {
      await Promise.all(imageList.map((url, idx) => 
        ProductImage.create({
          product_id: product.id,
          image_url: url,
          is_primary: idx === 0
        })
      ));
    }

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category }
      ]
    });

    res.status(201).json({ success: true, product: fullProduct || product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products (admin — includes inactive)
// @route   GET /api/admin/products
const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, status, category } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (search && search !== 'undefined') {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status && status !== 'undefined') {
      if (status === 'active') whereClause.is_active = true;
      if (status === 'inactive') whereClause.is_active = false;
      if (status === 'featured') whereClause.is_featured = true;
      if (status === 'trending') whereClause.is_trending = true;
    }

    if (category && category !== 'undefined') whereClause.category_id = category;

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary'] },
        { model: Category, attributes: ['name', 'slug'] },
        { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'stock_quantity', 'additional_price'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({
      success: true,
      products: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
const getAdminProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductVariant, as: 'variants' },
        { model: ProductImage, as: 'images' },
        { model: Category, attributes: ['id', 'name', 'slug'] },
      ],
    });

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const allowedFields = ['name', 'slug', 'description', 'base_price', 'sale_price', 'category_id', 'sku', 'brand', 'material', 'care_instructions', 'is_active', 'is_featured', 'is_trending', 'tags', 'meta_title', 'meta_description'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();

    // Handle image_url or images update if provided
    const { image_url, images } = req.body;
    const imageList = [];
    if (images && Array.isArray(images)) {
      images.forEach(img => {
        const url = typeof img === 'string' ? img : img.image_url;
        if (url && url.trim()) imageList.push(url.trim());
      });
    } else if (image_url && typeof image_url === 'string' && image_url.trim()) {
      imageList.push(image_url.trim());
    }

    if (imageList.length > 0) {
      for (let idx = 0; idx < imageList.length; idx++) {
        const url = imageList[idx];
        const [existing] = await ProductImage.findOrCreate({
          where: { product_id: product.id, image_url: url },
          defaults: { product_id: product.id, image_url: url, is_primary: idx === 0 }
        });
        if (idx === 0) {
          await ProductImage.update({ is_primary: false }, { where: { product_id: product.id } });
          await existing.update({ is_primary: true });
        }
      }
    }

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: Category }
      ]
    });

    res.json({ success: true, product: updatedProduct || product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product (soft-delete)
// @route   DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.is_active = false;
    await product.save();

    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle product featured status
// @route   PATCH /api/admin/products/:id/featured
const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    product.is_featured = req.body.is_featured !== undefined ? req.body.is_featured : !product.is_featured;
    await product.save();
    
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload product images
// @route   POST /api/admin/products/:id/images
const uploadProductImages = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const hasValidSupabase = () => {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
      if (!url || !key) return false;
      if (url.includes('placeholder') || url.includes('your-project') || url.includes('example')) return false;
      if (key.includes('placeholder') || key.includes('your_') || key.includes('example')) return false;
      return true;
    };

    const supabase = require('../config/supabase');
    const useSupabase = hasValidSupabase();

    const imagePromises = req.files.map(async (file, index) => {
      let imageUrl;
      let storagePath = null;

      if (useSupabase && file.buffer) {
        try {
          const fileExt = file.originalname.split('.').pop().toLowerCase();
          const fileName = `${product.id}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: true
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
            // Record the bucket path so we can delete the object later
            storagePath = fileName;
          }
        } catch (supabaseError) {
          console.warn('Supabase image upload failed, using disk fallback:', supabaseError.message);
        }
      }

      // Fallback to disk if Supabase failed or was not configured
      if (!imageUrl) {
        let filename = file.filename;
        if (!filename) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = path.extname(file.originalname) || '.jpg';
          filename = `${uniqueSuffix}${ext}`;
          if (file.buffer) {
            fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
          }
        }
        imageUrl = `/uploads/${filename}`;
      }

      return ProductImage.create({
        product_id: product.id,
        image_url: imageUrl,
        storage_path: storagePath,
        is_primary: index === 0
      });
    });

    const savedImages = await Promise.all(imagePromises);

    res.json({ success: true, images: savedImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product image
// @route   DELETE /api/admin/products/:id/images/:imageId
const deleteProductImage = async (req, res) => {
  try {
    const image = await ProductImage.findOne({
      where: { id: req.params.imageId, product_id: req.params.id },
    });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    // If this image was uploaded to Supabase Storage, remove the object too
    if (image.storage_path) {
      try {
        const supabase = require('../config/supabase');
        const { error } = await supabase.storage
          .from('product-images')
          .remove([image.storage_path]);
        if (error) {
          // Log but don't block the DB record deletion
          console.warn(`Supabase Storage delete failed for ${image.storage_path}:`, error.message);
        }
      } catch (storageErr) {
        console.warn('Supabase Storage removal skipped:', storageErr.message);
      }
    }

    await image.destroy();
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product variant
// @route   POST /api/admin/products/:id/variants
const createVariant = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { size, color, color_hex, stock_quantity, sku_variant, weight_grams, additional_price } = req.body;

    const variant = await ProductVariant.create({
      product_id: product.id,
      size, color, color_hex, stock_quantity, sku_variant, weight_grams, additional_price,
    });

    res.status(201).json({ success: true, variant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product variant
// @route   PUT /api/admin/products/:id/variants/:variantId
const updateVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.variantId, product_id: req.params.id },
    });
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

    const fields = ['size', 'color', 'color_hex', 'stock_quantity', 'sku_variant', 'weight_grams', 'additional_price'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) variant[field] = req.body[field];
    });

    await variant.save();
    res.json({ success: true, variant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product variant
// @route   DELETE /api/admin/products/:id/variants/:variantId
const deleteVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.variantId, product_id: req.params.id },
    });
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });

    await variant.destroy();
    res.json({ success: true, message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════

// @desc    Create a category
// @route   POST /api/admin/categories
const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id, description, image_url, sort_order } = req.body;

    const category = await Category.create({
      name, slug, parent_id, description, image_url, sort_order
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories (admin — includes inactive)
// @route   GET /api/admin/categories
const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [fn('COUNT', col('Products.id')), 'productCount']
        ]
      },
      include: [{ model: Product, attributes: [] }],
      group: ['Category.id'],
      order: [['sort_order', 'ASC']],
      subQuery: false,
    });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const fields = ['name', 'slug', 'parent_id', 'description', 'image_url', 'is_active', 'sort_order'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) category[field] = req.body[field];
    });

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (soft)
// @route   DELETE /api/admin/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    category.is_active = false;
    await category.save();
    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, payment_status, search, from, to } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (status) whereClause.status = status;
    if (payment_status) whereClause.payment_status = payment_status;

    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (from || to) {
      whereClause.created_at = {};
      if (from) whereClause.created_at[Op.gte] = new Date(from);
      if (to) whereClause.created_at[Op.lte] = new Date(to);
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'slug'] }] },
        { model: Address, as: 'shippingAddress' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({
      success: true,
      orders: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/admin/orders/:id
const getAdminOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: OrderItem, include: [{ model: Product }, { model: ProductVariant }] },
        { model: Address, as: 'shippingAddress' },
      ],
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // If changing to cancelled from non-cancelled status, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction: t });
      for (const item of orderItems) {
        if (item.variant_id) {
          const variant = await ProductVariant.findByPk(item.variant_id, { transaction: t, lock: t.LOCK.UPDATE });
          if (variant) {
            variant.stock_quantity += item.quantity;
            await variant.save({ transaction: t });
          }
        }
      }
    }

    order.status = status;
    if (status === 'shipped') order.shipped_at = new Date();
    if (status === 'delivered') order.delivered_at = new Date();

    await order.save({ transaction: t });

    // ─── Loyalty hooks ───────────────────────────────────────────────────────
    if (status === 'delivered' && order.points_awarded === 0 && order.payment_status === 'paid') {
      // Award points for this order if not already awarded
      try {
        await loyaltyService.awardPoints(order.user_id, order.id, order.total_amount, t);
      } catch (loyaltyErr) {
        // Non-fatal: log but do not fail the status update
        console.error('[Loyalty] awardPoints error:', loyaltyErr.message);
      }
    }

    if (status === 'returned') {
      // Reverse points, update return stats, possibly flag account
      try {
        const reasonCode = req.body.return_reason_code || null;
        if (reasonCode) {
          await Order.update({ return_reason_code: reasonCode }, { where: { id: order.id }, transaction: t });
        }
        await loyaltyService.reversePoints(order.user_id, order.id, reasonCode, t);
      } catch (loyaltyErr) {
        console.error('[Loyalty] reversePoints error:', loyaltyErr.message);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    await t.commit();
    res.json({ success: true, order });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tracking number
// @route   PUT /api/admin/orders/:id/tracking
const updateOrderTracking = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.tracking_number = req.body.tracking_number;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// USERS
// ═══════════════════════════════════════

// @desc    Get all users
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, role } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (search && search !== 'undefined') {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role && role !== 'undefined') whereClause.role = role;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash', 'firebase_uid'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      users: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user with orders
// @route   GET /api/admin/users/:id
const getAdminUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'firebase_uid'] },
      include: [
        { model: Order, order: [['created_at', 'DESC']], limit: 10 },
        { model: Address },
      ],
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (superadmin only)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { role } = req.body;
    const validRoles = ['customer', 'admin', 'superadmin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Prevent removing the last superadmin
    if (user.role === 'superadmin' && role !== 'superadmin') {
      const superadminCount = await User.count({ where: { role: 'superadmin' } });
      if (superadminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot remove the last superadmin' });
      }
    }

    user.role = role;
    await user.save();
    res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════

// @desc    Get all coupons
// @route   GET /api/admin/coupons
const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      order: [['valid_until', 'DESC']],
    });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create coupon
// @route   POST /api/admin/coupons
const createCoupon = async (req, res) => {
  try {
    const { code, type, value, min_order_value, max_discount, usage_limit, per_user_limit, valid_from, valid_until, applicable_categories, applicable_products } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type, value, min_order_value, max_discount, usage_limit, per_user_limit,
      valid_from, valid_until, applicable_categories, applicable_products,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const fields = ['code', 'type', 'value', 'min_order_value', 'max_discount', 'usage_limit', 'per_user_limit', 'valid_from', 'valid_until', 'is_active', 'applicable_categories', 'applicable_products'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) coupon[field] = req.body[field];
    });

    await coupon.save();
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (soft)
// @route   DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    coupon.is_active = false;
    await coupon.save();
    res.json({ success: true, message: 'Coupon deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ═══════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════

// @desc    Get all reviews
// @route   GET /api/admin/reviews
const getAdminReviews = async (req, res) => {
  try {
    const { page = 1, limit = 15, approved } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = {};
    if (approved !== undefined) whereClause.is_approved = approved === 'true';

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        { model: Product, attributes: ['name', 'slug'] },
        { model: User, attributes: ['full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    res.json({
      success: true,
      reviews: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/reject review
// @route   PUT /api/admin/reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.body.is_approved !== undefined) review.is_approved = req.body.is_approved;
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.destroy();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  // Dashboard
  getDashboard,
  // Products
  createProduct,
  getAdminProducts,
  getAdminProduct,
  updateProduct,
  deleteProduct,
  toggleFeaturedProduct,
  uploadProductImages,
  deleteProductImage,
  createVariant,
  updateVariant,
  deleteVariant,
  // Categories
  createCategory,
  getAdminCategories,
  updateCategory,
  deleteCategory,
  // Orders
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  updateOrderTracking,
  // Users
  getAdminUsers,
  getAdminUser,
  updateUserRole,
  // Coupons
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // Reviews
  getAdminReviews,
  updateReview,
  deleteReview,
};
