import { Skeleton } from '../common/Skeleton';

const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col space-y-4">
          <Skeleton variant="rounded" className="w-full aspect-[3/4] rounded-2xl" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-1/3 h-3" />
            <div className="flex justify-between items-center gap-4">
              <Skeleton variant="text" className="w-2/3 h-4" />
              <Skeleton variant="text" className="w-1/4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeletonGrid;
