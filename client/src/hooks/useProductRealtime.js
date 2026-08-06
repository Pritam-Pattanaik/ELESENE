/**
 * useProductRealtime
 *
 * Subscribes to Supabase Realtime postgres_changes on the `products` table.
 * Patches the React Query cache in-place so the admin product list stays live
 * without triggering a full refetch on every change event.
 *
 * Usage:
 *   const { realtimeEvent } = useProductRealtime({ queryParams, onExternalChange });
 *
 * Props:
 *   queryParams      — the same params object passed to useAdminProducts (page, limit, search, status)
 *   onExternalChange — optional callback called with the raw payload on every remote event
 *
 * Returns:
 *   realtimeEvent — the most recent { type, product } or null; useful for toasts
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { fetchAdminProduct } from '../api/admin';

const BUCKET = 'elesene-realtime-products'; // unique channel name

export function useProductRealtime({ queryParams = {}, onExternalChange } = {}) {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const [realtimeEvent, setRealtimeEvent] = useState(null);

  // Build the cache key that matches what useAdminProducts uses
  const cacheKey = ['admin-products', queryParams];

  useEffect(() => {
    // Bail out gracefully if Supabase is not configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      console.info('[Realtime] Supabase not configured — skipping realtime subscription.');
      return;
    }

    const channel = supabase
      .channel(`${BUCKET}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          try {
            if (eventType === 'INSERT') {
              // Fetch the full product record (with images, variants, category)
              // so we have the same shape as the REST list response
              const data = await fetchAdminProduct(newRecord.id).catch(() => null);
              const fullProduct = data?.product;

              if (fullProduct) {
                queryClient.setQueryData(cacheKey, (prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    totalCount: (prev.totalCount || 0) + 1,
                    products: [fullProduct, ...(prev.products || [])],
                  };
                });

                setRealtimeEvent({ type: 'INSERT', product: fullProduct });
                onExternalChange?.({ type: 'INSERT', product: fullProduct });
              }
            } else if (eventType === 'UPDATE') {
              // Fetch the updated full record
              const data = await fetchAdminProduct(newRecord.id).catch(() => null);
              const fullProduct = data?.product;

              if (fullProduct) {
                queryClient.setQueryData(cacheKey, (prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    products: (prev.products || []).map((p) =>
                      p.id === fullProduct.id ? fullProduct : p
                    ),
                  };
                });

                setRealtimeEvent({ type: 'UPDATE', product: fullProduct });
                onExternalChange?.({ type: 'UPDATE', product: fullProduct });
              }
            } else if (eventType === 'DELETE') {
              const deletedId = oldRecord?.id;

              if (deletedId) {
                queryClient.setQueryData(cacheKey, (prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    totalCount: Math.max(0, (prev.totalCount || 1) - 1),
                    products: (prev.products || []).filter((p) => p.id !== deletedId),
                  };
                });

                setRealtimeEvent({ type: 'DELETE', product: { id: deletedId } });
                onExternalChange?.({ type: 'DELETE', product: { id: deletedId } });
              }
            }
          } catch (err) {
            // Non-fatal — fall back to full refetch
            console.warn('[Realtime] Patch failed, refetching:', err.message);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[Realtime] Subscribed to products table changes.');
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('[Realtime] Channel error on products subscription.');
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  // Auto-clear the event after 4 s so toasts dismiss themselves
  useEffect(() => {
    if (!realtimeEvent) return;
    const timer = setTimeout(() => setRealtimeEvent(null), 4000);
    return () => clearTimeout(timer);
  }, [realtimeEvent]);

  return { realtimeEvent };
}
