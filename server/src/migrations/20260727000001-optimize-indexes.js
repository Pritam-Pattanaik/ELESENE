'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for performance optimization
    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email', unique: true });
    await queryInterface.addIndex('users', ['phone'], { name: 'idx_users_phone', unique: true });
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
    await queryInterface.addIndex('users', ['referral_code'], { name: 'idx_users_referral_code', unique: true });

    await queryInterface.addIndex('categories', ['slug'], { name: 'idx_categories_slug', unique: true });
    await queryInterface.addIndex('categories', ['parent_id'], { name: 'idx_categories_parent_id' });
    await queryInterface.addIndex('categories', ['is_active'], { name: 'idx_categories_active' });
    await queryInterface.addIndex('categories', ['sort_order'], { name: 'idx_categories_sort' });

    await queryInterface.addIndex('products', ['slug'], { name: 'idx_products_slug', unique: true });
    await queryInterface.addIndex('products', ['sku'], { name: 'idx_products_sku', unique: true });
    await queryInterface.addIndex('products', ['category_id'], { name: 'idx_products_category' });
    await queryInterface.addIndex('products', ['is_active'], { name: 'idx_products_active' });
    await queryInterface.addIndex('products', ['is_featured'], { name: 'idx_products_featured' });
    await queryInterface.addIndex('products', ['is_trending'], { name: 'idx_products_trending' });
    await queryInterface.addIndex('products', ['base_price'], { name: 'idx_products_price' });
    await queryInterface.addIndex('products', ['created_at'], { name: 'idx_products_created' });

    await queryInterface.addIndex('product_variants', ['product_id'], { name: 'idx_variants_product' });
    await queryInterface.addIndex('product_variants', ['size'], { name: 'idx_variants_size' });
    await queryInterface.addIndex('product_variants', ['color'], { name: 'idx_variants_color' });
    await queryInterface.addIndex('product_variants', ['sku_variant'], { name: 'idx_variants_sku', unique: true });

    await queryInterface.addIndex('product_images', ['product_id'], { name: 'idx_images_product' });
    await queryInterface.addIndex('product_images', ['is_primary'], { name: 'idx_images_primary' });

    await queryInterface.addIndex('orders', ['order_number'], { name: 'idx_orders_number', unique: true });
    await queryInterface.addIndex('orders', ['user_id'], { name: 'idx_orders_user' });
    await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
    await queryInterface.addIndex('orders', ['payment_status'], { name: 'idx_orders_payment' });
    await queryInterface.addIndex('orders', ['created_at'], { name: 'idx_orders_created' });

    await queryInterface.addIndex('order_items', ['order_id'], { name: 'idx_order_items_order' });
    await queryInterface.addIndex('order_items', ['product_id'], { name: 'idx_order_items_product' });
    await queryInterface.addIndex('order_items', ['variant_id'], { name: 'idx_order_items_variant' });

    await queryInterface.addIndex('carts', ['user_id'], { name: 'idx_carts_user' });
    await queryInterface.addIndex('carts', ['session_id'], { name: 'idx_carts_session' });

    await queryInterface.addIndex('cart_items', ['cart_id'], { name: 'idx_cart_items_cart' });
    await queryInterface.addIndex('cart_items', ['product_id'], { name: 'idx_cart_items_product' });
    await queryInterface.addIndex('cart_items', ['variant_id'], { name: 'idx_cart_items_variant' });

    await queryInterface.addIndex('addresses', ['user_id'], { name: 'idx_addresses_user' });
    await queryInterface.addIndex('reviews', ['product_id'], { name: 'idx_reviews_product' });
    await queryInterface.addIndex('reviews', ['user_id'], { name: 'idx_reviews_user' });
    await queryInterface.addIndex('reviews', ['is_approved'], { name: 'idx_reviews_approved' });

    await queryInterface.addIndex('coupons', ['code'], { name: 'idx_coupons_code', unique: true });
    await queryInterface.addIndex('coupons', ['is_active'], { name: 'idx_coupons_active' });

    await queryInterface.addIndex('wishlists', ['user_id'], { name: 'idx_wishlists_user' });
    await queryInterface.addIndex('wishlists', ['product_id'], { name: 'idx_wishlists_product' });

    // Fix: Add updated_at to products table (was missing)
    await queryInterface.addColumn('products', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'updated_at');

    await queryInterface.removeIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.removeIndex('users', ['phone'], { name: 'idx_users_phone' });
    await queryInterface.removeIndex('users', ['role'], { name: 'idx_users_role' });
    await queryInterface.removeIndex('users', ['referral_code'], { name: 'idx_users_referral_code' });

    await queryInterface.removeIndex('categories', ['slug'], { name: 'idx_categories_slug' });
    await queryInterface.removeIndex('categories', ['parent_id'], { name: 'idx_categories_parent_id' });
    await queryInterface.removeIndex('categories', ['is_active'], { name: 'idx_categories_active' });
    await queryInterface.removeIndex('categories', ['sort_order'], { name: 'idx_categories_sort' });

    await queryInterface.removeIndex('products', ['slug'], { name: 'idx_products_slug' });
    await queryInterface.removeIndex('products', ['sku'], { name: 'idx_products_sku' });
    await queryInterface.removeIndex('products', ['category_id'], { name: 'idx_products_category' });
    await queryInterface.removeIndex('products', ['is_active'], { name: 'idx_products_active' });
    await queryInterface.removeIndex('products', ['is_featured'], { name: 'idx_products_featured' });
    await queryInterface.removeIndex('products', ['is_trending'], { name: 'idx_products_trending' });
    await queryInterface.removeIndex('products', ['base_price'], { name: 'idx_products_price' });
    await queryInterface.removeIndex('products', ['created_at'], { name: 'idx_products_created' });

    await queryInterface.removeIndex('product_variants', ['product_id'], { name: 'idx_variants_product' });
    await queryInterface.removeIndex('product_variants', ['size'], { name: 'idx_variants_size' });
    await queryInterface.removeIndex('product_variants', ['color'], { name: 'idx_variants_color' });
    await queryInterface.removeIndex('product_variants', ['sku_variant'], { name: 'idx_variants_sku' });

    await queryInterface.removeIndex('product_images', ['product_id'], { name: 'idx_images_product' });
    await queryInterface.removeIndex('product_images', ['is_primary'], { name: 'idx_images_primary' });

    await queryInterface.removeIndex('orders', ['order_number'], { name: 'idx_orders_number' });
    await queryInterface.removeIndex('orders', ['user_id'], { name: 'idx_orders_user' });
    await queryInterface.removeIndex('orders', ['status'], { name: 'idx_orders_status' });
    await queryInterface.removeIndex('orders', ['payment_status'], { name: 'idx_orders_payment' });
    await queryInterface.removeIndex('orders', ['created_at'], { name: 'idx_orders_created' });

    await queryInterface.removeIndex('order_items', ['order_id'], { name: 'idx_order_items_order' });
    await queryInterface.removeIndex('order_items', ['product_id'], { name: 'idx_order_items_product' });
    await queryInterface.removeIndex('order_items', ['variant_id'], { name: 'idx_order_items_variant' });

    await queryInterface.removeIndex('carts', ['user_id'], { name: 'idx_carts_user' });
    await queryInterface.removeIndex('carts', ['session_id'], { name: 'idx_carts_session' });

    await queryInterface.removeIndex('cart_items', ['cart_id'], { name: 'idx_cart_items_cart' });
    await queryInterface.removeIndex('cart_items', ['product_id'], { name: 'idx_cart_items_product' });
    await queryInterface.removeIndex('cart_items', ['variant_id'], { name: 'idx_cart_items_variant' });

    await queryInterface.removeIndex('addresses', ['user_id'], { name: 'idx_addresses_user' });
    await queryInterface.removeIndex('reviews', ['product_id'], { name: 'idx_reviews_product' });
    await queryInterface.removeIndex('reviews', ['user_id'], { name: 'idx_reviews_user' });
    await queryInterface.removeIndex('reviews', ['is_approved'], { name: 'idx_reviews_approved' });

    await queryInterface.removeIndex('coupons', ['code'], { name: 'idx_coupons_code' });
    await queryInterface.removeIndex('coupons', ['is_active'], { name: 'idx_coupons_active' });

    await queryInterface.removeIndex('wishlists', ['user_id'], { name: 'idx_wishlists_user' });
    await queryInterface.removeIndex('wishlists', ['product_id'], { name: 'idx_wishlists_product' });
  }
};