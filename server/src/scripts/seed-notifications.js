/**
 * seed-notifications.js
 * Seeds test notifications for the customer1@test.com user.
 * Usage: node src/scripts/seed-notifications.js
 */

require('../config/env')
const { sequelize, User, Notification } = require('../models');

async function seedNotifications() {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Find the test customer
    const user = await User.findOne({ where: { email: 'customer1@test.com' } });
    if (!user) {
      console.error('Test user customer1@test.com not found. Run the main seed first.');
      process.exit(1);
    }

    console.log(`Seeding notifications for user: ${user.email} (id: ${user.id})`);

    // Delete existing notifications for this user first (idempotent)
    await Notification.destroy({ where: { user_id: user.id } });

    const now = new Date();
    const notifications = [
      {
        user_id: user.id,
        title: 'New Arrival Alert',
        message: 'Your wishlisted Silk Slip Dress is back in stock in your size. Shop before it sells out.',
        type: 'wishlist',
        is_read: false,
        created_at: new Date(now - 1 * 60 * 60 * 1000),   // 1 hour ago
        updated_at: new Date(now - 1 * 60 * 60 * 1000),
      },
      {
        user_id: user.id,
        title: 'Order Shipped',
        message: 'Your order #EL-1234 has been dispatched and is on its way. Expected delivery: 2–3 business days.',
        type: 'order',
        is_read: false,
        created_at: new Date(now - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: user.id,
        title: 'Exclusive Member Offer',
        message: 'Enjoy 20% off on all silk and velvet pieces this week. Use code SILK20 at checkout.',
        type: 'promo',
        is_read: false,
        created_at: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: user.id,
        title: 'Order Delivered',
        message: 'Your Velvet Evening Gown has been delivered. We hope you love it! Share your look with #ELESENE.',
        type: 'order',
        is_read: true,
        read_at: new Date(now - 2 * 24 * 60 * 60 * 1000),
        created_at: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: user.id,
        title: 'Welcome to ELESENE',
        message: 'Your account is set up and ready. Explore our curated collections and discover your signature style.',
        type: 'account',
        is_read: true,
        read_at: new Date(now - 6 * 24 * 60 * 60 * 1000),
        created_at: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(now - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    await Notification.bulkCreate(notifications, { returning: true });

    const unread = notifications.filter(n => !n.is_read).length;
    console.log(`✓ Seeded ${notifications.length} notifications (${unread} unread) for ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seedNotifications();
