import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationRead, deleteNotification } from '../../api/user';
import { NotificationSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getNotifications({ page: pageNum, limit: 10 });
      setNotifications(data?.notifications || []);
      setTotalPages(data?.pagination?.totalPages || 1);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        await fetchNotifications(page);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      const data = await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date() } : n));
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const data = await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.3.75 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'promo':
        return (
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        );
      case 'wishlist':
        return (
          <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-[#0070D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        );
    }
  };

  if (loading) {
    return <NotificationSkeleton count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-ivory tracking-wide">Notifications</h2>
          <p className="text-xs text-ivory/60 mt-1 font-futura">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          }
          title="No Notifications"
          description="You have no notifications yet. We will notify you about order updates, exclusive offers, and account activity."
          primaryAction={{
            label: "Browse Collection",
            to: "/shop"
          }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 border rounded-xl flex gap-4 items-start shadow-sm transition-all duration-300 hover:shadow-md ${
                  n.is_read ? 'bg-white border-black/5' : 'bg-white border-gold/20'
                }`}
              >
                <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-zinc-50 border border-black/5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-bold text-ivory font-futura">{n.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-[9px] font-futura text-gold hover:text-gold-light uppercase tracking-wider font-bold transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-[9px] font-futura text-red-500 hover:text-red-600 uppercase tracking-wider font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-ivory/60 leading-relaxed font-futura font-light">{n.message}</p>
                  <p className="text-[9px] text-ivory/40 font-futura">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-black/10 rounded-lg text-xs font-futura text-ivory/70 hover:text-ivory hover:border-black/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[10px] text-ivory/50 font-futura">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-black/10 rounded-lg text-xs font-futura text-ivory/70 hover:text-ivory hover:border-black/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
