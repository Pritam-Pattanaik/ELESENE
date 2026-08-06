const { Category } = require('../models');

// @desc    Get all categories (nested tree)
// @route   GET /api/categories
let cachedCategoryTree = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 300000; // 5 minutes cache

const getCategories = async (req, res) => {
  try {
    const now = Date.now();
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

    if (cachedCategoryTree && (now - lastCacheTime < CACHE_TTL_MS)) {
      return res.json({ success: true, categories: cachedCategoryTree });
    }

    // Fetch all active categories
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']]
    });

    // Helper to build tree
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item.toJSON(),
          subCategories: buildTree(items, item.id)
        }));
    };

    cachedCategoryTree = buildTree(categories);
    lastCacheTime = now;

    res.json({ success: true, categories: cachedCategoryTree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories
};
