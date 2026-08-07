import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminToken } from '../../api/authHelper';
import { getImageUrl } from '../../utils/imageUrl';
import { API_URL } from '../../api/config';

const FeaturedProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      try {
        const token = getAdminToken();
        const res = await fetch(`${API_URL}/admin/products?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        if (mounted) setProducts(data.products || []);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadProducts();
    return () => { mounted = false; };
  }, [API_URL]);

  const toggleFeatured = async (product) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`${API_URL}/admin/products/${product.id}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !product.is_featured })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-futura">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Featured Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage which products appear on the homepage collections.</p>
        </div>
        <input 
          type="text" 
          placeholder="Search products..." 
          className="border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading products...</div>
      ) : error ? (
        <div className="text-red-500 py-10">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-black/5">
              <tr>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold text-center">Featured on Homepage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.map(product => {
                const imgUrl = product.images?.[0]?.image_url ? getImageUrl(product.images[0].image_url) : null;
                return (
                  <motion.tr key={product.id} layout className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.Category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      ₹{Number(product.base_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={product.is_featured} 
                          onChange={() => toggleFeatured(product)} 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                    </td>
                  </motion.tr>
                );
              })}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    No products found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsTab;
