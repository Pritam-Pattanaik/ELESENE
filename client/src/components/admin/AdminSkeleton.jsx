
export const AdminCardSkeleton = () => (
  <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="w-9 h-9 bg-white/10 rounded-lg" />
    </div>
    <div className="h-8 bg-white/10 rounded w-1/2" />
    <div className="h-3 bg-white/5 rounded w-1/4" />
  </div>
);

export const AdminTableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-center pb-4 border-b border-white/10">
      <div className="h-5 bg-white/10 rounded w-1/4" />
      <div className="h-9 bg-white/10 rounded-xl w-32" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 py-3 border-b border-white/5 items-center">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 bg-white/10 rounded ${cIdx === 0 ? 'w-1/4' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="space-y-8 p-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 bg-white/10 rounded-lg w-64 animate-pulse" />
        <div className="h-4 bg-white/5 rounded w-96 animate-pulse" />
      </div>
      <div className="h-10 bg-white/10 rounded-xl w-40 animate-pulse" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <AdminCardSkeleton key={idx} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#18181b] border border-white/10 rounded-2xl p-6 h-72 animate-pulse space-y-4">
        <div className="h-5 bg-white/10 rounded w-1/3" />
        <div className="h-48 bg-white/5 rounded-xl w-full" />
      </div>
      <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 h-72 animate-pulse space-y-4">
        <div className="h-5 bg-white/10 rounded w-1/2" />
        <div className="h-44 bg-white/5 rounded-full w-44 mx-auto" />
      </div>
    </div>

    <AdminTableSkeleton rows={5} cols={5} />
  </div>
);

export default AdminDashboardSkeleton;
