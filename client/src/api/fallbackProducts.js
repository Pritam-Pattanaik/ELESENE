// Fallback product data — lazy-loaded only when the API is unavailable
// Extracted from products.js to keep the main bundle smaller

const FALLBACK_PRODUCTS = [
  // ─── DRESSES ────────────────────────────────────────────────────────────────
  {
    id: 'f1',
    name: 'Silk Ombré Maxi Gown',
    slug: 'silk-ombre-maxi-gown',
    base_price: 14999,
    brand: 'ELESENE',
    description: 'Floor-length Mulberry silk gown with hand-dyed ombré gradient. Corseted bodice, open back, and a sweeping train. A statement piece for every evening.',
    category: { name: 'Dresses', slug: 'dresses' },
    is_featured: true, is_trending: true, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop', is_primary: true },
      { image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', is_primary: false }
    ],
    variants: [
      { id: 'v1a', size: 'XS', color: 'Rose', stock_quantity: 4, additional_price: 0 },
      { id: 'v1b', size: 'S',  color: 'Rose', stock_quantity: 10, additional_price: 0 },
      { id: 'v1c', size: 'M',  color: 'Rose', stock_quantity: 8, additional_price: 0 },
      { id: 'v1d', size: 'L',  color: 'Rose', stock_quantity: 5, additional_price: 0 }
    ]
  },
  {
    id: 'f2',
    name: 'Ruched Satin Midi Dress',
    slug: 'ruched-satin-midi-dress',
    base_price: 9499,
    brand: 'ELESENE',
    description: 'Bias-cut satin dress with figure-sculpting ruching at the waist. Adjustable spaghetti straps and a midi-length hem that moves beautifully.',
    category: { name: 'Dresses', slug: 'dresses' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v2a', size: 'XS', color: 'Champagne', stock_quantity: 6, additional_price: 0 },
      { id: 'v2b', size: 'S',  color: 'Champagne', stock_quantity: 12, additional_price: 0 },
      { id: 'v2c', size: 'M',  color: 'Champagne', stock_quantity: 9, additional_price: 0 },
      { id: 'v2d', size: 'L',  color: 'Champagne', stock_quantity: 4, additional_price: 0 }
    ]
  },
  {
    id: 'f3',
    name: 'Crystal-Trim Slip Dress',
    slug: 'crystal-trim-slip-dress',
    base_price: 12499,
    brand: 'ELESENE',
    description: 'Pure Mulberry silk slip dress adorned with a hand-sewn glass crystal hem. Delicate lace insets at the bodice create an ethereal silhouette.',
    category: { name: 'Dresses', slug: 'dresses' },
    is_featured: true, is_trending: false, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v3a', size: 'XS', color: 'Ivory', stock_quantity: 8, additional_price: 0 },
      { id: 'v3b', size: 'S',  color: 'Ivory', stock_quantity: 15, additional_price: 0 },
      { id: 'v3c', size: 'M',  color: 'Ivory', stock_quantity: 10, additional_price: 0 }
    ]
  },
  {
    id: 'f4',
    name: 'Structured Organza Mini',
    slug: 'structured-organza-mini',
    base_price: 8299,
    brand: 'ELESENE',
    description: 'Architectural organza mini dress with voluminous sleeves and a fitted bodice. A modern take on feminine drama — perfect for bold occasions.',
    category: { name: 'Dresses', slug: 'dresses' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v4a', size: 'S',  color: 'Black', stock_quantity: 7, additional_price: 0 },
      { id: 'v4b', size: 'M',  color: 'Black', stock_quantity: 11, additional_price: 0 },
      { id: 'v4c', size: 'L',  color: 'Black', stock_quantity: 3, additional_price: 0 }
    ]
  },
  {
    id: 'f5',
    name: 'Velvet Wrap Evening Dress',
    slug: 'velvet-wrap-evening-dress',
    base_price: 11999,
    brand: 'ELESENE',
    description: 'Deep V-neck wrap dress in sumptuous crushed velvet. Self-tie waist belt, flutter sleeves, and a floor-grazing length that commands attention.',
    category: { name: 'Dresses', slug: 'dresses' },
    is_featured: true, is_trending: true, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v5a', size: 'XS', color: 'Burgundy', stock_quantity: 5, additional_price: 0 },
      { id: 'v5b', size: 'S',  color: 'Burgundy', stock_quantity: 9, additional_price: 0 },
      { id: 'v5c', size: 'M',  color: 'Burgundy', stock_quantity: 7, additional_price: 0 },
      { id: 'v5d', size: 'L',  color: 'Midnight', stock_quantity: 6, additional_price: 500 }
    ]
  },
  // ─── TOPS ────────────────────────────────────────────────────────────────────
  {
    id: 'f6',
    name: 'Silk Corset Blouse',
    slug: 'silk-corset-blouse',
    base_price: 6499,
    brand: 'ELESENE',
    description: 'Structured corset-style blouse in washed silk. Boning detail, lace-up back closure, and a peplum hem. Pairs effortlessly with wide-leg trousers.',
    category: { name: 'Tops', slug: 'tops' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v6a', size: 'XS', color: 'Ivory', stock_quantity: 10, additional_price: 0 },
      { id: 'v6b', size: 'S',  color: 'Ivory', stock_quantity: 14, additional_price: 0 },
      { id: 'v6c', size: 'M',  color: 'Ivory', stock_quantity: 8, additional_price: 0 },
      { id: 'v6d', size: 'S',  color: 'Black', stock_quantity: 12, additional_price: 0 }
    ]
  },
  {
    id: 'f7',
    name: 'Off-Shoulder Draped Top',
    slug: 'off-shoulder-draped-top',
    base_price: 4999,
    brand: 'ELESENE',
    description: 'Fluid crepe off-shoulder top with exquisite draping at the neckline. Invisible side zip closure. An effortlessly chic piece for day-to-night dressing.',
    category: { name: 'Tops', slug: 'tops' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v7a', size: 'XS', color: 'Nude',  stock_quantity: 6, additional_price: 0 },
      { id: 'v7b', size: 'S',  color: 'Nude',  stock_quantity: 11, additional_price: 0 },
      { id: 'v7c', size: 'M',  color: 'Nude',  stock_quantity: 7, additional_price: 0 },
      { id: 'v7d', size: 'L',  color: 'Black', stock_quantity: 8, additional_price: 0 }
    ]
  },
  {
    id: 'f8',
    name: 'Embroidered Sheer Blouse',
    slug: 'embroidered-sheer-blouse',
    base_price: 7299,
    brand: 'ELESENE',
    description: 'Sheer georgette blouse with intricate hand-embroidered floral detailing. Relaxed silhouette with a subtle lustre. Wear open for an editorial look.',
    category: { name: 'Tops', slug: 'tops' },
    is_featured: false, is_trending: false, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v8a', size: 'S', color: 'White', stock_quantity: 9, additional_price: 0 },
      { id: 'v8b', size: 'M', color: 'White', stock_quantity: 13, additional_price: 0 },
      { id: 'v8c', size: 'L', color: 'White', stock_quantity: 4, additional_price: 0 }
    ]
  },
  // ─── TROUSERS & BOTTOMS ───────────────────────────────────────────────────
  {
    id: 'f9',
    name: 'Wide-Leg Tailored Trousers',
    slug: 'wide-leg-tailored-trousers',
    base_price: 8999,
    brand: 'ELESENE',
    description: 'High-rise wide-leg trousers in double-faced wool crepe. Clean knife pleats, side pockets, and a precision-finished hem that elongates the silhouette.',
    category: { name: 'Trousers', slug: 'trousers' },
    is_featured: true, is_trending: true, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v9a', size: 'XS', color: 'Camel', stock_quantity: 5, additional_price: 0 },
      { id: 'v9b', size: 'S',  color: 'Camel', stock_quantity: 10, additional_price: 0 },
      { id: 'v9c', size: 'M',  color: 'Camel', stock_quantity: 8, additional_price: 0 },
      { id: 'v9d', size: 'L',  color: 'Black', stock_quantity: 6, additional_price: 0 }
    ]
  },
  {
    id: 'f10',
    name: 'Leather-Look Flared Pants',
    slug: 'leather-look-flared-pants',
    base_price: 10499,
    brand: 'ELESENE',
    description: 'High-waisted flared trousers in PU leather with a subtle sheen. A 70s-inspired silhouette reimagined for the modern wardrobe.',
    category: { name: 'Trousers', slug: 'trousers' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v10a', size: 'XS', color: 'Noir', stock_quantity: 7, additional_price: 0 },
      { id: 'v10b', size: 'S',  color: 'Noir', stock_quantity: 12, additional_price: 0 },
      { id: 'v10c', size: 'M',  color: 'Noir', stock_quantity: 9, additional_price: 0 }
    ]
  },
  // ─── CO-ORDS & SETS ───────────────────────────────────────────────────────
  {
    id: 'f11',
    name: 'Linen Blazer & Trouser Co-ord',
    slug: 'linen-blazer-trouser-coord',
    base_price: 17499,
    brand: 'ELESENE',
    description: 'Relaxed-fit linen blazer with matching wide-leg trousers. Notch lapels, single-button closure, and tapered ankle-length leg. Sold as a complete set.',
    category: { name: 'Co-ords', slug: 'coords' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v11a', size: 'XS', color: 'Oatmeal', stock_quantity: 4, additional_price: 0 },
      { id: 'v11b', size: 'S',  color: 'Oatmeal', stock_quantity: 8, additional_price: 0 },
      { id: 'v11c', size: 'M',  color: 'Oatmeal', stock_quantity: 6, additional_price: 0 },
      { id: 'v11d', size: 'L',  color: 'Black',   stock_quantity: 5, additional_price: 0 }
    ]
  },
  {
    id: 'f12',
    name: 'Silk Crop Top & Skirt Set',
    slug: 'silk-crop-top-skirt-set',
    base_price: 13999,
    brand: 'ELESENE',
    description: 'Coordinated set featuring a silk crop top and bias-cut midi skirt. Fluid drape, self-tie waist detail, and a subtle jacquard weave pattern.',
    category: { name: 'Co-ords', slug: 'coords' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v12a', size: 'XS', color: 'Champagne', stock_quantity: 5, additional_price: 0 },
      { id: 'v12b', size: 'S',  color: 'Champagne', stock_quantity: 9, additional_price: 0 },
      { id: 'v12c', size: 'M',  color: 'Sage',      stock_quantity: 7, additional_price: 0 }
    ]
  },
  // ─── OUTERWEAR ───────────────────────────────────────────────────────────
  {
    id: 'f13',
    name: 'Architectural Trench Coat',
    slug: 'architectural-trench-coat',
    base_price: 21999,
    brand: 'ELESENE',
    description: 'Double-breasted gabardine trench coat with storm flap, gun flap, and buffalo horn buttons. A heritage silhouette with razor-sharp modern tailoring.',
    category: { name: 'Outerwear', slug: 'outerwear' },
    is_featured: true, is_trending: true, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v13a', size: 'S', color: 'Camel',  stock_quantity: 4, additional_price: 0 },
      { id: 'v13b', size: 'M', color: 'Camel',  stock_quantity: 6, additional_price: 0 },
      { id: 'v13c', size: 'L', color: 'Camel',  stock_quantity: 3, additional_price: 0 },
      { id: 'v13d', size: 'M', color: 'Black',  stock_quantity: 5, additional_price: 0 }
    ]
  },
  {
    id: 'f14',
    name: 'Oversized Bouclé Jacket',
    slug: 'oversized-boucle-jacket',
    base_price: 19499,
    brand: 'ELESENE',
    description: 'Cocoon-shaped jacket in premium French bouclé. Gold-toned chain trim at the hem, patch pockets, and an oversized silhouette inspired by Chanel couture.',
    category: { name: 'Outerwear', slug: 'outerwear' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v14a', size: 'XS', color: 'Cream',  stock_quantity: 3, additional_price: 0 },
      { id: 'v14b', size: 'S',  color: 'Cream',  stock_quantity: 5, additional_price: 0 },
      { id: 'v14c', size: 'M',  color: 'Black',  stock_quantity: 4, additional_price: 0 }
    ]
  },
  {
    id: 'f15',
    name: 'Faux-Fur Statement Coat',
    slug: 'faux-fur-statement-coat',
    base_price: 24999,
    brand: 'ELESENE',
    description: 'Luxe faux-fur coat in a sweeping A-line silhouette. Deep plush pile, satin-lined interior, and oversized lapels for a dramatic, editorial finish.',
    category: { name: 'Outerwear', slug: 'outerwear' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v15a', size: 'XS', color: 'Ivory',  stock_quantity: 2, additional_price: 0 },
      { id: 'v15b', size: 'S',  color: 'Ivory',  stock_quantity: 4, additional_price: 0 },
      { id: 'v15c', size: 'M',  color: 'Caramel',stock_quantity: 3, additional_price: 0 }
    ]
  },
  // ─── KNITWEAR ────────────────────────────────────────────────────────────
  {
    id: 'f16',
    name: 'Cashmere Turtleneck Sweater',
    slug: 'cashmere-turtleneck-sweater',
    base_price: 13499,
    brand: 'ELESENE',
    description: 'Grade-A Mongolian cashmere turtleneck in a relaxed silhouette. Ribbed cuffs and hem, seamless construction, and incomparably soft to the touch.',
    category: { name: 'Knitwear', slug: 'knitwear' },
    is_featured: true, is_trending: false, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v16a', size: 'XS', color: 'Camel',  stock_quantity: 8, additional_price: 0 },
      { id: 'v16b', size: 'S',  color: 'Camel',  stock_quantity: 12, additional_price: 0 },
      { id: 'v16c', size: 'M',  color: 'Ivory',  stock_quantity: 9, additional_price: 0 },
      { id: 'v16d', size: 'L',  color: 'Black',  stock_quantity: 5, additional_price: 0 }
    ]
  },
  {
    id: 'f17',
    name: 'Open-Back Knit Dress',
    slug: 'open-back-knit-dress',
    base_price: 10999,
    brand: 'ELESENE',
    description: 'Elegant ribbed knit dress with a sculptural open-back detail. Midi length, long sleeves, and a body-skimming fit that transitions from desk to dinner.',
    category: { name: 'Knitwear', slug: 'knitwear' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v17a', size: 'XS', color: 'Ecru',  stock_quantity: 6, additional_price: 0 },
      { id: 'v17b', size: 'S',  color: 'Ecru',  stock_quantity: 10, additional_price: 0 },
      { id: 'v17c', size: 'M',  color: 'Mocha', stock_quantity: 8, additional_price: 0 }
    ]
  },
  // ─── SKIRTS ─────────────────────────────────────────────────────────────
  {
    id: 'f18',
    name: 'Pleated Silk Midi Skirt',
    slug: 'pleated-silk-midi-skirt',
    base_price: 9299,
    brand: 'ELESENE',
    description: 'Accordion-pleated silk midi skirt with a high elasticated waistband. The pleats unfurl with every step — fluid, luminous, and effortlessly styled.',
    category: { name: 'Skirts', slug: 'skirts' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v18a', size: 'XS', color: 'Blush', stock_quantity: 7, additional_price: 0 },
      { id: 'v18b', size: 'S',  color: 'Blush', stock_quantity: 11, additional_price: 0 },
      { id: 'v18c', size: 'M',  color: 'Navy',  stock_quantity: 6, additional_price: 0 },
      { id: 'v18d', size: 'L',  color: 'Navy',  stock_quantity: 4, additional_price: 0 }
    ]
  },
  {
    id: 'f19',
    name: 'Leather Wrap Mini Skirt',
    slug: 'leather-wrap-mini-skirt',
    base_price: 7899,
    brand: 'ELESENE',
    description: 'Wrap-style mini skirt in buttery lambskin leather. Asymmetric hem, self-tie belt, and a supple drape that flatters every body type.',
    category: { name: 'Skirts', slug: 'skirts' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v19a', size: 'XS', color: 'Noir',  stock_quantity: 5, additional_price: 0 },
      { id: 'v19b', size: 'S',  color: 'Noir',  stock_quantity: 8, additional_price: 0 },
      { id: 'v19c', size: 'M',  color: 'Brown', stock_quantity: 6, additional_price: 0 }
    ]
  },
  // ─── EVENING & BRIDAL ────────────────────────────────────────────────────
  {
    id: 'f20',
    name: 'Feather-Trim Evening Gown',
    slug: 'feather-trim-evening-gown',
    base_price: 27999,
    brand: 'ELESENE',
    description: 'Strapless column gown in duchess satin with hand-finished marabou feather trim along the neckline. Red-carpet drama for the most discerning occasions.',
    category: { name: 'Evening Wear', slug: 'evening-wear' },
    is_featured: true, is_trending: true, is_new: false,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v20a', size: 'XS', color: 'Black',  stock_quantity: 2, additional_price: 0 },
      { id: 'v20b', size: 'S',  color: 'Black',  stock_quantity: 3, additional_price: 0 },
      { id: 'v20c', size: 'M',  color: 'Ivory',  stock_quantity: 2, additional_price: 1500 }
    ]
  },
  {
    id: 'f21',
    name: 'Sequined Backless Gown',
    slug: 'sequined-backless-gown',
    base_price: 22499,
    brand: 'ELESENE',
    description: 'Full-length sequined gown with a dramatic backless design and a deep V-neckline. Thousands of hand-applied micro-sequins catch the light magnificently.',
    category: { name: 'Evening Wear', slug: 'evening-wear' },
    is_featured: true, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v21a', size: 'XS', color: 'Gold',   stock_quantity: 3, additional_price: 0 },
      { id: 'v21b', size: 'S',  color: 'Gold',   stock_quantity: 5, additional_price: 0 },
      { id: 'v21c', size: 'M',  color: 'Silver', stock_quantity: 4, additional_price: 0 }
    ]
  },
  // ─── ACCESSORIES ─────────────────────────────────────────────────────────
  {
    id: 'f22',
    name: 'Chain-Handle Micro Bag',
    slug: 'chain-handle-micro-bag',
    base_price: 8499,
    brand: 'ELESENE',
    description: 'Micro-sized structured bag in polished calfskin with a 24k gold-plated chain handle. Internal card slots and a detachable crossbody strap.',
    category: { name: 'Accessories', slug: 'accessories' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v22a', size: 'One Size', color: 'Black',  stock_quantity: 15, additional_price: 0 },
      { id: 'v22b', size: 'One Size', color: 'Tan',    stock_quantity: 10, additional_price: 0 },
      { id: 'v22c', size: 'One Size', color: 'Blush',  stock_quantity: 8, additional_price: 0 }
    ]
  },
  {
    id: 'f23',
    name: 'Silk Twill Square Scarf',
    slug: 'silk-twill-square-scarf',
    base_price: 4299,
    brand: 'ELESENE',
    description: 'Hand-rolled 90x90cm square scarf in pure silk twill. Exclusive botanical print, vibrant colourway, and a feather-light drape. Wear it endless ways.',
    category: { name: 'Accessories', slug: 'accessories' },
    is_featured: false, is_trending: false, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v23a', size: 'One Size', color: 'Floral',  stock_quantity: 20, additional_price: 0 },
      { id: 'v23b', size: 'One Size', color: 'Paisley', stock_quantity: 18, additional_price: 0 }
    ]
  },
  {
    id: 'f24',
    name: 'Statement Pearl Earrings',
    slug: 'statement-pearl-earrings',
    base_price: 3799,
    brand: 'ELESENE',
    description: 'Oversized baroque pearl drop earrings in irregular natural pearl with sterling silver posts. A modern heirloom that bridges classic and contemporary.',
    category: { name: 'Jewellery', slug: 'jewellery' },
    is_featured: false, is_trending: true, is_new: true,
    images: [
      { image_url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=1000&auto=format&fit=crop', is_primary: true }
    ],
    variants: [
      { id: 'v24a', size: 'One Size', color: 'White Pearl', stock_quantity: 25, additional_price: 0 },
      { id: 'v24b', size: 'One Size', color: 'Black Pearl', stock_quantity: 18, additional_price: 500 }
    ]
  }
];

const FALLBACK_CATEGORIES = [
  { id: 'c1', name: 'Dresses',      slug: 'dresses' },
  { id: 'c2', name: 'Tops',         slug: 'tops' },
  { id: 'c3', name: 'Trousers',     slug: 'trousers' },
  { id: 'c4', name: 'Co-ords',      slug: 'coords' },
  { id: 'c5', name: 'Outerwear',    slug: 'outerwear' },
  { id: 'c6', name: 'Knitwear',     slug: 'knitwear' },
  { id: 'c7', name: 'Skirts',       slug: 'skirts' },
  { id: 'c8', name: 'Evening Wear', slug: 'evening-wear' },
  { id: 'c9', name: 'Accessories',  slug: 'accessories' },
  { id: 'c10', name: 'Jewellery',   slug: 'jewellery' }
];

export { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES };

