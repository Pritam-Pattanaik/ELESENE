const { Category } = require('../models');

// @desc    Get all categories (nested tree)
// @route   GET /api/categories
const getCategories = async (req, res) => {
  try {
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

    const categoryTree = buildTree(categories);

    res.json({ success: true, categories: categoryTree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories
};
