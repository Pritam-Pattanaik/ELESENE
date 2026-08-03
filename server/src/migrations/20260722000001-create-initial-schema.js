'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable uuid-ossp extension if PostgreSQL
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').catch(() => {});

    // 1. Users Table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      firebase_uid: {
        type: Sequelize.STRING(128),
        unique: true,
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(15),
        unique: true,
      },
      full_name: Sequelize.STRING(100),
      profile_picture: Sequelize.TEXT,
      gender: Sequelize.STRING(20),
      date_of_birth: Sequelize.DATEONLY,
      persona: Sequelize.STRING(50),
      referral_code: {
        type: Sequelize.STRING(20),
        unique: true,
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      role: {
        type: Sequelize.ENUM('customer', 'admin', 'superadmin'),
        defaultValue: 'customer',
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      reset_password_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      reset_password_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      verification_token_expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      token_version: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      referred_by: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. Categories Table
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.UUID,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
      image_url: Sequelize.TEXT,
      description: Sequelize.TEXT,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    });

    // 3. Products Table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
      },
      description: Sequelize.TEXT,
      brand: {
        type: Sequelize.STRING(100),
        defaultValue: 'ELESENE',
      },
      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      sale_price: Sequelize.DECIMAL(10, 2),
      sku: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.UUID,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      material: Sequelize.TEXT,
      care_instructions: Sequelize.TEXT,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_trending: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      tags: Sequelize.ARRAY(Sequelize.STRING),
      meta_title: Sequelize.STRING(255),
      meta_description: Sequelize.TEXT,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 4. Product Variants Table
    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      size: Sequelize.STRING(20),
      color: Sequelize.STRING(50),
      color_hex: Sequelize.STRING(7),
      stock_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      sku_variant: {
        type: Sequelize.STRING(150),
        unique: true,
      },
      weight_grams: Sequelize.INTEGER,
      additional_price: {
        type: Sequelize.DECIMAL(8, 2),
        defaultValue: 0,
      },
    });

    // 5. Product Images Table
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      alt_text: Sequelize.STRING(255),
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      color_tag: Sequelize.STRING(50),
    });

    // 6. Addresses Table
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: Sequelize.STRING(50),
      full_name: Sequelize.STRING(100),
      phone: Sequelize.STRING(15),
      address_line1: Sequelize.TEXT,
      address_line2: Sequelize.TEXT,
      city: Sequelize.STRING(100),
      state: Sequelize.STRING(100),
      pincode: Sequelize.STRING(10),
      country: {
        type: Sequelize.STRING(50),
        defaultValue: 'UK',
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });

    // 7. Coupons Table
    await queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      type: Sequelize.STRING(20),
      value: Sequelize.DECIMAL(8, 2),
      min_order_value: Sequelize.DECIMAL(8, 2),
      max_discount: Sequelize.DECIMAL(8, 2),
      usage_limit: Sequelize.INTEGER,
      usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      per_user_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      valid_from: Sequelize.DATE,
      valid_until: Sequelize.DATE,
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      applicable_categories: Sequelize.ARRAY(Sequelize.UUID),
      applicable_products: Sequelize.ARRAY(Sequelize.UUID),
    });

    // 8. Orders Table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      coupon_id: {
        type: Sequelize.UUID,
        references: { model: 'coupons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      shipping_address_id: {
        type: Sequelize.UUID,
        references: { model: 'addresses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      order_number: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
      },
      subtotal: Sequelize.DECIMAL(10, 2),
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total_amount: Sequelize.DECIMAL(10, 2),
      payment_status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
      },
      payment_method: Sequelize.STRING(50),
      razorpay_order_id: Sequelize.STRING(100),
      razorpay_payment_id: Sequelize.STRING(100),
      tracking_number: Sequelize.STRING(100),
      shipped_at: Sequelize.DATE,
      delivered_at: Sequelize.DATE,
      notes: Sequelize.TEXT,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 9. Order Items Table
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.UUID,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      variant_id: {
        type: Sequelize.UUID,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      product_snapshot: Sequelize.JSONB,
    });

    // 10. Carts Table
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      session_id: Sequelize.STRING(255),
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 11. Cart Items Table
    await queryInterface.createTable('cart_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      cart_id: {
        type: Sequelize.UUID,
        references: { model: 'carts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      variant_id: {
        type: Sequelize.UUID,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 12. Reviews Table
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_id: {
        type: Sequelize.UUID,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      rating: Sequelize.INTEGER,
      title: Sequelize.STRING(150),
      body: Sequelize.TEXT,
      images: Sequelize.ARRAY(Sequelize.TEXT),
      fit_feedback: Sequelize.STRING(50),
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 13. Wishlists Table
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      variant_id: {
        type: Sequelize.UUID,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wishlists');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('carts');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('product_variants');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  }
};
