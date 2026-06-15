const { User, Address, Wishlist, Product, ProductVariant, ProductImage } = require('../models');

// @desc    Get user profile
// @route   GET /api/user/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
const updateUserProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        loyalty_points: user.loyalty_points,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user addresses
// @route   GET /api/user/addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.id }
    });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/user/addresses
const addAddress = async (req, res) => {
  try {
    const { label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
    
    // If this is set as default, unset others
    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    // Check if this is the first address, make it default automatically
    const count = await Address.count({ where: { user_id: req.user.id } });
    const shouldBeDefault = is_default || count === 0;

    const address = await Address.create({
      user_id: req.user.id,
      label, full_name, phone, address_line1, address_line2, city, state, pincode, country,
      is_default: shouldBeDefault
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/user/addresses/:id
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { is_default, ...updateData } = req.body;
    
    if (is_default && !address.is_default) {
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    await address.update({ ...updateData, is_default: is_default !== undefined ? is_default : address.is_default });
    
    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await address.destroy();
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          include: [{ model: ProductImage, as: 'images' }]
        },
        {
          model: ProductVariant
        }
      ]
    });
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/user/wishlist
const addToWishlist = async (req, res) => {
  try {
    const { product_id, variant_id } = req.body;
    
    const exists = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id, variant_id: variant_id || null }
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'Item already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({
      user_id: req.user.id,
      product_id,
      variant_id: variant_id || null
    });

    res.status(201).json({ success: true, wishlistItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/user/wishlist/:id
const removeFromWishlist = async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    
    if (!wishlistItem) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
    }

    await wishlistItem.destroy();
    res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
