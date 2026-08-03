/**
 * Seed script to populate categories and products with images and variants.
 * Run once: node src/scripts/seed-data.js
 */
require('../config/env')
const { Category, Product, ProductImage, ProductVariant } = require('../models');
const sequelize = require('../config/db');

const initialCategories = [
  { name: 'Evening Wear', slug: 'evening-wear', description: 'Timeless evening dresses and gowns for special occasions.' },
  { name: 'Bridal', slug: 'bridal', description: 'Couture bridal wear designed for your special day.' },
  { name: 'Resort', slug: 'resort', description: 'High-fashion resort apparel, swimwear, and lightweight fabrics.' },
  { name: 'Accessories', slug: 'accessories', description: 'Luxury designer accessories, handbags, and fine jewelry.' },
  { name: 'Pret-A-Porter', slug: 'pret-a-porter', description: 'Ready-to-wear tailored essentials and structured styling.' },
  { name: 'Shoes', slug: 'shoes', description: 'Premium designer pumps, high heels, and artisanal footwear.' }
];

const initialProducts = [
  {
    name: 'Silk Slip Dress',
    slug: 'silk-slip-dress',
    description: 'A delicate, fluid silk slip dress with clean minimalist lines, finished with an elegant low back draping.',
    brand: 'ELESENE',
    base_price: 4999.00,
    sku: 'ELS-SLK-SLP-01',
    categorySlug: 'evening-wear',
    is_featured: true,
    is_trending: true,
    tags: ['NEW', 'SILK'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', alt_text: 'Silk Slip Dress Front', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Ivory Gold', color_hex: '#E8D48B', stock_quantity: 15 },
      { size: 'M', color: 'Ivory Gold', color_hex: '#E8D48B', stock_quantity: 20 },
      { size: 'L', color: 'Ivory Gold', color_hex: '#E8D48B', stock_quantity: 10 }
    ]
  },
  {
    name: 'Velvet Evening Gown',
    slug: 'velvet-evening-gown',
    description: 'An elegant structured deep-burgundy velvet gown, complete with an off-shoulder neckline and a high-slit profile.',
    brand: 'ELESENE',
    base_price: 12499.00,
    sku: 'ELS-VLV-EVG-02',
    categorySlug: 'evening-wear',
    is_featured: true,
    is_trending: true,
    tags: ['BESTSELLER', 'VELVET'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=600&auto=format&fit=crop', alt_text: 'Velvet Evening Gown Front', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Burgundy', color_hex: '#800020', stock_quantity: 8 },
      { size: 'M', color: 'Burgundy', color_hex: '#800020', stock_quantity: 12 },
      { size: 'L', color: 'Burgundy', color_hex: '#800020', stock_quantity: 5 }
    ]
  },
  {
    name: 'Crystal Embellished Top',
    slug: 'crystal-embellished-top',
    description: 'A couture corset top covered in hand-embroidered shimmering crystals, designed to capture light elegantly.',
    brand: 'ELESENE',
    base_price: 3499.00,
    sku: 'ELS-CRY-TOP-03',
    categorySlug: 'pret-a-porter',
    is_featured: true,
    is_trending: true,
    tags: ['TRENDING', 'CRYSTAL'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', alt_text: 'Crystal Embellished Top Front', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Silver', color_hex: '#C0C0C0', stock_quantity: 25 },
      { size: 'M', color: 'Silver', color_hex: '#C0C0C0', stock_quantity: 30 }
    ]
  },
  {
    name: 'Noir Tailored Suit',
    slug: 'noir-tailored-suit',
    description: 'A sharp, structured double-breasted blazer and trousers set in signature noir premium virgin wool.',
    brand: 'ELESENE',
    base_price: 15999.00,
    sku: 'ELS-NOR-SUT-04',
    categorySlug: 'pret-a-porter',
    is_featured: true,
    is_trending: false,
    tags: ['EXCLUSIVE', 'WOOL'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=600&auto=format&fit=crop', alt_text: 'Noir Tailored Suit Model', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Noir Black', color_hex: '#0A0A0A', stock_quantity: 10 },
      { size: 'M', color: 'Noir Black', color_hex: '#0A0A0A', stock_quantity: 15 },
      { size: 'L', color: 'Noir Black', color_hex: '#0A0A0A', stock_quantity: 8 }
    ]
  },
  {
    name: 'Luxe Satin Dress',
    slug: 'luxe-satin-dress',
    description: 'A flowy gold satin dress with asymmetric draping across the shoulders and a fluid midi-length skirt silhouette.',
    brand: 'ELESENE',
    base_price: 6999.00,
    sku: 'ELS-SAT-DRS-05',
    categorySlug: 'evening-wear',
    is_featured: true,
    is_trending: true,
    tags: ['NEW', 'SATIN'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop', alt_text: 'Luxe Satin Dress Model', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Champagne Gold', color_hex: '#F0E68C', stock_quantity: 18 },
      { size: 'M', color: 'Champagne Gold', color_hex: '#F0E68C', stock_quantity: 22 },
      { size: 'L', color: 'Champagne Gold', color_hex: '#F0E68C', stock_quantity: 14 }
    ]
  },
  {
    name: 'Chiffon Resort Gown',
    slug: 'chiffon-resort-gown',
    description: 'A breathable, lightweight chiffon maxi gown in sandy ivory, featuring an open back and micro pleated details.',
    brand: 'ELESENE',
    base_price: 8999.00,
    sku: 'ELS-CHF-RSG-06',
    categorySlug: 'resort',
    is_featured: false,
    is_trending: false,
    tags: ['RESORT', 'CHIFFON'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop', alt_text: 'Chiffon Resort Gown Front', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Sand', color_hex: '#E1C699', stock_quantity: 12 },
      { size: 'M', color: 'Sand', color_hex: '#E1C699', stock_quantity: 16 }
    ]
  },
  {
    name: 'Monogram Leather Bag',
    slug: 'monogram-leather-bag',
    description: 'Handcrafted signature calfskin leather box handbag featuring polished gold-finish custom hardware closures.',
    brand: 'ELESENE',
    base_price: 18499.00,
    sku: 'ELS-MNG-BAG-07',
    categorySlug: 'accessories',
    is_featured: false,
    is_trending: false,
    tags: ['LEATHER', 'LIMITED'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop', alt_text: 'Monogram Leather Bag Detail', is_primary: true }
    ],
    variants: [
      { size: 'OS', color: 'Cognac Brown', color_hex: '#9E5B3D', stock_quantity: 6 }
    ]
  },
  {
    name: 'Linen Belted Set',
    slug: 'linen-belted-set',
    description: 'A matching lightweight French linen set featuring wide-leg trousers and a belted safari wrap shirt.',
    brand: 'ELESENE',
    base_price: 5499.00,
    sku: 'ELS-LNN-SET-08',
    categorySlug: 'pret-a-porter',
    is_featured: false,
    is_trending: false,
    tags: ['LINEN', 'CASUAL'],
    images: [
      { image_url: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=600&auto=format&fit=crop', alt_text: 'Linen Belted Set Front', is_primary: true }
    ],
    variants: [
      { size: 'S', color: 'Sage Green', color_hex: '#8F9779', stock_quantity: 14 },
      { size: 'M', color: 'Sage Green', color_hex: '#8F9779', stock_quantity: 20 },
      { size: 'L', color: 'Sage Green', color_hex: '#8F9779', stock_quantity: 12 }
    ]
  }
];

async function seedData() {
  try {
    console.log('Synchronizing database schema...');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // 1. Seed Categories
    console.log('Seeding categories...');
    const categoryMap = {};
    for (const catData of initialCategories) {
      const [category] = await Category.findOrCreate({
        where: { slug: catData.slug },
        defaults: catData
      });
      categoryMap[catData.slug] = category.id;
      console.log(`- Category: ${category.name}`);
    }

    // 2. Seed Products
    console.log('Seeding products, images, and variants...');
    for (const prodData of initialProducts) {
      const categoryId = categoryMap[prodData.categorySlug];
      if (!categoryId) {
        console.warn(`Category slug "${prodData.categorySlug}" not found! Skipping product "${prodData.name}".`);
        continue;
      }

      // Check if product already exists
      const existingProd = await Product.findOne({ where: { slug: prodData.slug } });
      if (existingProd) {
        console.log(`Product already exists: ${prodData.name}`);
        continue;
      }

      // Create Product
      const product = await Product.create({
        name: prodData.name,
        slug: prodData.slug,
        description: prodData.description,
        brand: prodData.brand,
        base_price: prodData.base_price,
        sku: prodData.sku,
        category_id: categoryId,
        is_featured: prodData.is_featured,
        is_trending: prodData.is_trending,
        tags: prodData.tags
      });

      // Create Images
      for (const imgData of prodData.images) {
        await ProductImage.create({
          product_id: product.id,
          image_url: imgData.image_url,
          alt_text: imgData.alt_text,
          is_primary: imgData.is_primary
        });
      }

      // Create Variants
      for (const varData of prodData.variants) {
        await ProductVariant.create({
          product_id: product.id,
          size: varData.size,
          color: varData.color,
          color_hex: varData.color_hex,
          stock_quantity: varData.stock_quantity,
          sku_variant: `${product.sku}-${varData.size}-${varData.color.replace(/\s+/g, '')}`
        });
      }

      console.log(`+ Product created: ${product.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed data:', error);
    process.exit(1);
  }
}

seedData();
