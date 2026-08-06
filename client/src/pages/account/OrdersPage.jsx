import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserOrders } from '../../api/orders';
import { OrdersSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { getImageUrl } from '../../utils/imageUrl';

const OrdersPage = () => {
  const { isAuthenticated } = useCustomerAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserOrders();
      setOrders(Array.isArray(data) ? data : (data?.orders || []));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      fetchOrders().catch(err => {
        if (isMounted) setError(err);
      });
    }
    return () => { isMounted = false; };
  }, [fetchOrders, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: '/account/orders' }} replace />;
  }

  if (loading) {
    return <OrdersSkeleton count={3} />;
  }

  if (error) {
    if (error.status === 401) {
      return <Navigate to="/auth" state={{ from: '/account/orders' }} replace />;
    }
    return (
      <ErrorState 
        error={error} 
        context="general" 
        onRetry={fetchOrders} 
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        }
        title="No Orders Yet"
        description="You have not placed any orders with ELESENE yet. Explore our luxury releases to begin your collection."
        primaryAction={{
          label: "Discover Collection",
          to: "/shop"
        }}
      />
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gold-light bg-amber-50 border-amber-200';
    }
  };

  const renderTimeline = (status) => {
    const steps = [
      { key: 'placed', label: 'Ordered', desc: 'Order placed & confirmed.' },
      { key: 'processing', label: 'Processing', desc: 'Tailoring & quality checks.' },
      { key: 'shipped', label: 'Shipped', desc: 'In transit with premium courier.' },
      { key: 'delivered', label: 'Delivered', desc: 'Delivered to your doorstep.' }
    ];

    if (status.toLowerCase() === 'cancelled') {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-futura text-[10px] tracking-wide uppercase font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          Order Cancelled
        </div>
      );
    }

    const currentStepIdx = steps.findIndex(step => step.key === status.toLowerCase());
    const activeIdx = currentStepIdx !== -1 ? currentStepIdx : 0;

    return (
      <div className="relative pl-5 space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-black/10">
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.key} className="relative flex flex-col items-start text-left">
              <div className={`absolute -left-[18px] top-1.5 w-2 h-2 rounded-full border transition-all duration-500 ${
                isCompleted 
                  ? 'bg-gold border-gold shadow-[0_0_6px_rgba(201,168,76,0.6)]' 
                  : 'bg-white border-black/15'
              } ${isCurrent ? 'scale-125' : ''}`} />
              
              <span className={`text-[9px] font-futura tracking-widest uppercase font-bold ${isCompleted ? 'text-gold-light' : 'text-ivory/70'}`}>
                {step.label}
              </span>
              {isCurrent && (
                <p className="text-[10px] font-futura text-ivory/70 mt-0.5 leading-snug">
                  {step.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-h4 font-bold text-ivory mb-6 uppercase tracking-wider">Order History</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#161616] border border-white/[0.07] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-500/20 transition-all duration-300">
            
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-black/5">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-1 font-bold">Order Number</span>
                  <span className="text-ivory font-futura tracking-wider text-sm font-bold">{order.order_number}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-1 font-bold">Date Placed</span>
                  <span className="text-ivory/80 font-futura text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-1 font-bold">Total Amount</span>
                  <span className="text-gold-light font-futura tracking-wider text-sm font-bold">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div>
                <span className={`inline-flex px-3 py-1 text-[9px] font-futura tracking-widest uppercase border rounded-full font-bold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Content area: list of items + timeline */}
            <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
              
              {/* Product list */}
              <div className="flex-1 space-y-4 w-full">
                {order.OrderItems?.map((item) => {
                  const product = item.Product;
                  const price = parseFloat(item.price);
                  const imgUrl = product?.images?.[0]?.image_url;
                  const fullImgUrl = imgUrl ? getImageUrl(imgUrl) : null;

                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className="w-16 h-20 bg-black/5 rounded-lg overflow-hidden flex-shrink-0 border border-black/5 relative">
                        {fullImgUrl ? (
                          <img 
                            src={fullImgUrl} 
                            alt={product?.name ? `${product.name} product thumbnail` : 'Order item product'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full bg-black/5 flex items-center justify-center text-ivory/30 text-xs font-futura">No Image</div>
                        )}
                      </div>
                      
                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-ivory font-futura text-sm font-bold truncate group-hover:text-gold transition-colors duration-300">{product?.name || 'Unknown Tailored Product'}</h4>
                        <p className="text-ivory/70 font-futura text-xs mt-0.5 font-medium">
                          {item.ProductVariant?.color && `Color: ${item.ProductVariant.color}`}
                          {item.ProductVariant?.size && ` | Size: ${item.ProductVariant.size}`}
                        </p>
                        <p className="text-ivory/70 font-futura text-[10px] mt-0.5 font-medium">Qty: {item.quantity}</p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-ivory font-futura tracking-wider text-sm font-semibold">₹{price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Timeline */}
              <div className="w-full lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-black/5 pt-6 lg:pt-0 lg:pl-6">
                <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-ivory/70 mb-3 font-bold">Shipment Tracker</span>
                {renderTimeline(order.status)}
                
                {order.tracking_number && (
                  <div className="mt-4 pt-3 border-t border-black/5">
                    <p className="text-[9px] font-futura text-ivory/70 uppercase tracking-widest font-bold">
                      Awb Ref: <span className="text-ivory font-mono tracking-wide font-normal select-all">{order.tracking_number}</span>
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;

