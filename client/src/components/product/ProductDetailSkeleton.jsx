import { Skeleton } from '../common/Skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 md:gap-16">
      {/* Left Column Skeleton */}
      <Skeleton variant="rounded" className="h-[500px] md:h-[750px] w-full rounded-2xl" />

      {/* Right Column Skeleton */}
      <div className="flex flex-col space-y-8 pt-6">
        <div className="space-y-4 border-b border-black/10 pb-8">
          <Skeleton variant="text" className="w-1/4 h-3" />
          <Skeleton variant="text" className="w-3/4 h-10" />
          <Skeleton variant="text" className="w-1/3 h-8" />
        </div>

        <div className="space-y-3">
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-5/6 h-4" />
          <Skeleton variant="text" className="w-4/6 h-4" />
        </div>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-1/6 h-3" />
            <div className="flex gap-3">
              <Skeleton variant="circular" className="w-8 h-8" />
              <Skeleton variant="circular" className="w-8 h-8" />
              <Skeleton variant="circular" className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton variant="text" className="w-1/6 h-3" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" className="h-10 rounded-lg" />
              ))}
            </div>
          </div>

          <Skeleton variant="rounded" className="h-14 w-full rounded-xl mt-8" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
