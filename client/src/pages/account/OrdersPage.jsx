import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserOrders } from '../../api/orders';
import { OrdersSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import useCustomerAuthStore from '../../store/customerAuthStore';
import { getImageUrl } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/currency';


const OrdersPage = () => {
  const { isAuthenticated } = useCustomerAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
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
      const timer = setTimeout(() => {
        fetchOrders(false).catch(err => {
          if (isMounted) setError(err);
        });
      }, 0);
      return () => { isMounted = false; clearTimeout(timer); };
    }
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
      case 'delivered': return 'text-[#2E8B57] bg-[#2E8B57]/10 border-[#2E8B57]/30';
      case 'shipped': return 'text-[#2F6BFF] bg-[#2F6BFF]/10 border-[#2F6BFF]/30';
      case 'cancelled': return 'text-[#D14343] bg-[#D14343]/10 border-[#D14343]/30';
      default: return 'text-[#B99246] bg-[#B99246]/10 border-[#B99246]/30';
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
      <div className="relative pl-5 space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#EFECE7]">
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={step.key} className="relative flex flex-col items-start text-left">
              <div className={`absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border transition-all duration-500 ${
                isCompleted 
                  ? 'bg-[#B99246] border-[#B99246] shadow-[0_0_8px_rgba(185,146,70,0.5)]' 
                  : 'bg-white border-[#E8E5DF]'
              } ${isCurrent ? 'scale-125' : ''}`} />
              
              <span className={`text-[9px] font-futura tracking-widest uppercase font-bold ${isCompleted ? 'text-[#B99246]' : 'text-[#909090]'}`}>
                {step.label}
              </span>
              {isCurrent && (
                <p className="text-[10px] font-futura text-[#6F6F6F] mt-0.5 leading-snug">
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
      <h2 className="text-xl font-display font-semibold text-[#141414] mb-6 uppercase tracking-wider">Order History</h2>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-[#E8E5DF] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#B99246]/30 transition-all duration-300">
            
            {/* Header info */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#EFECE7]">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-1 font-bold">Order Number</span>
                  <span className="text-[#141414] font-futura tracking-wider text-sm font-bold">{order.order_number}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-1 font-bold">Date Placed</span>
                  <span className="text-[#6F6F6F] font-futura text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-1 font-bold">Total Amount</span>
                  <span className="text-[#B99246] font-futura tracking-wider text-sm font-bold">
                    {formatCurrency(order.total_amount ?? order.totalAmount ?? order.grandTotal, { context: 'OrdersPage Order Total' })}
                  </span>
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
                  const itemUnitPrice = item.unit_price ?? item.price ?? (item.total_price && item.quantity ? item.total_price / item.quantity : 0);
                  const imgUrl = product?.images?.[0]?.image_url;
                  const fullImgUrl = imgUrl ? getImageUrl(imgUrl) : null;

                  return (
                    <div key={item.id} className="flex items-center gap-4 group">
                      <div className="w-16 h-20 bg-[#F5F4F2] rounded-lg overflow-hidden flex-shrink-0 border border-[#E8E5DF] relative">
                        {fullImgUrl ? (
                          <img 
                            src={fullImgUrl} 
                            alt={product?.name ? `${product.name} product thumbnail` : 'Order item product'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#F5F4F2] flex items-center justify-center text-[#909090] text-xs font-futura">No Image</div>
                        )}
                      </div>
                      
                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#141414] font-futura text-sm font-bold truncate group-hover:text-[#B99246] transition-colors duration-300">{product?.name || 'Unknown Tailored Product'}</h4>
                        <p className="text-[#6F6F6F] font-futura text-xs mt-0.5 font-medium">
                          {item.ProductVariant?.color && `Color: ${item.ProductVariant.color}`}
                          {item.ProductVariant?.size && ` | Size: ${item.ProductVariant.size}`}
                        </p>
                        <p className="text-[#909090] font-futura text-[10px] mt-0.5 font-medium">Qty: {item.quantity}</p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#141414] font-futura tracking-wider text-sm font-semibold">
                          {formatCurrency(itemUnitPrice, { context: 'OrdersPage Item Unit Price' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Timeline */}
              <div className="w-full lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-[#EFECE7] pt-6 lg:pt-0 lg:pl-6">
                <span className="block text-[9px] font-futura tracking-[0.2em] uppercase text-[#6F6F6F] mb-3 font-bold">Shipment Tracker</span>
                {renderTimeline(order.status)}
                
                {order.tracking_number && (
                  <div className="mt-4 pt-3 border-t border-[#EFECE7]">
                    <p className="text-[9px] font-futura text-[#6F6F6F] uppercase tracking-widest font-bold">
                      Awb Ref: <span className="text-[#141414] font-mono tracking-wide font-normal select-all">{order.tracking_number}</span>
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


