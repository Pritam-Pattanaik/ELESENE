/**
 * Primitive Skeleton Loader component with gold shimmer animation overlay.
 */
export const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  animation = 'shimmer',
  style = {}
}) => {
  const baseStyle = "bg-ivory/[0.06] border border-black/5 relative overflow-hidden";
  const animationStyle = animation === 'shimmer' ? 'shimmer' : 'animate-pulse';

  const variantStyles = {
    text: 'h-4 rounded-md w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  return (
    <div
      className={`${baseStyle} ${variantStyles[variant] || ''} ${animationStyle} ${className}`}
      style={{ width, height, ...style }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent animate-shimmer pointer-events-none" />
    </div>
  );
};

/**
 * CartDrawer Skeleton
 */
export const CartSkeleton = () => (
  <div className="space-y-6 py-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 p-4 border border-black/5 rounded-xl bg-white/40">
        <Skeleton variant="rounded" className="w-20 h-28 shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-3/4 h-4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton variant="rounded" className="w-16 h-7" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
        </div>
      </div>
    ))}
    <div className="pt-6 border-t border-black/10 space-y-3">
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-20 h-4" />
        <Skeleton variant="text" className="w-24 h-4" />
      </div>
      <Skeleton variant="rounded" className="w-full h-12" />
    </div>
  </div>
);

/**
 * Wishlist Page Skeleton Grid
 */
export const WishlistSkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-4 p-4 bg-white/40 rounded-2xl border border-black/5">
        <Skeleton variant="rounded" className="w-full aspect-[3/4] rounded-xl" />
        <div className="space-y-2">
          <Skeleton variant="text" className="w-3/4 h-4" />
          <Skeleton variant="text" className="w-1/3 h-4" />
        </div>
        <Skeleton variant="rounded" className="w-full h-10" />
      </div>
    ))}
  </div>
);

/**
 * Orders Page Skeleton Loader
 */
export const OrdersSkeleton = () => (
  <div className="space-y-6">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white/40 border border-black/5 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-black/5">
          <div className="space-y-1">
            <Skeleton variant="text" className="w-36 h-4" />
            <Skeleton variant="text" className="w-24 h-3" />
          </div>
          <Skeleton variant="rounded" className="w-24 h-7" />
        </div>
        <div className="flex items-center gap-4 py-2">
          <Skeleton variant="rounded" className="w-16 h-20 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-1/2 h-4" />
            <Skeleton variant="text" className="w-1/4 h-3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Address Cards Grid Skeleton
 */
export const AddressSkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2].map((i) => (
      <div key={i} className="p-6 bg-white/40 border border-black/5 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-32 h-5" />
          <Skeleton variant="rounded" className="w-16 h-6" />
        </div>
        <Skeleton variant="text" className="w-full h-3" />
        <Skeleton variant="text" className="w-3/4 h-3" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="pt-4 flex gap-3">
          <Skeleton variant="rounded" className="w-20 h-9" />
          <Skeleton variant="rounded" className="w-20 h-9" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Profile Page Skeleton
 */
export const ProfileSkeleton = () => (
  <div className="space-y-8">
    <Skeleton variant="rounded" className="w-full h-56 rounded-3xl" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" className="h-28 rounded-2xl" />
      ))}
    </div>
    <div className="bg-white/40 border border-black/5 rounded-2xl p-6 space-y-4">
      <Skeleton variant="text" className="w-48 h-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rounded" className="h-12" />
        <Skeleton variant="rounded" className="h-12" />
      </div>
    </div>
  </div>
);

/**
 * Checkout Page Skeleton
 */
export const CheckoutSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <div className="lg:col-span-7 space-y-6">
      <Skeleton variant="rounded" className="w-full h-40 rounded-2xl" />
      <Skeleton variant="rounded" className="w-full h-64 rounded-2xl" />
    </div>
    <div className="lg:col-span-5 space-y-6">
      <Skeleton variant="rounded" className="w-full h-80 rounded-2xl" />
    </div>
  </div>
);

export const NotificationSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 border border-black/5 rounded-xl flex gap-4 items-start">
        <Skeleton variant="circular" className="w-9 h-9 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-3" />
          <Skeleton variant="text" className="w-full h-2.5" />
          <Skeleton variant="text" className="w-1/4 h-2" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
