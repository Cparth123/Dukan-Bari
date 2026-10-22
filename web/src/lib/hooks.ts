/**
 * React Query hooks for Dukan Bari API data fetching
 * Centralizes all API calls with caching, deduplication, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─────────────────────────────────────────────────────────────
// QUERY KEYS (centralised to prevent typos & allow invalidation)
// ─────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  store: (idOrOwnerId: string) => ['store', idOrOwnerId] as const,
  storesByCity: (city: string, category?: string, search?: string) =>
    ['stores', city, category, search] as const,
  products: (storeId: string) => ['products', storeId] as const,
  offers: (storeId: string) => ['offers', storeId] as const,
  conversations: (storeId: string) => ['conversations', storeId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
};

// ─────────────────────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────────────────────

/** Fetch a single store (by id or owner_id) */
export function useStore(params: { id?: string; owner_id?: string }) {
  const key = params.id || params.owner_id || '';
  return useQuery({
    queryKey: QUERY_KEYS.store(key),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.id) qs.set('id', params.id);
      if (params.owner_id) qs.set('owner_id', params.owner_id);
      const res = await fetch(`/api/store?${qs.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch store');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Store fetch failed');
      return { store: json.store, products: json.products || [] };
    },
    enabled: !!(params.id || params.owner_id),
  });
}

/** Fetch nearby stores (for explore / merchant shops tab) */
export function useNearbyStores(params: {
  city?: string;
  category?: string;
  search?: string;
  lat?: number;
  lng?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.storesByCity(params.city || '', params.category, params.search),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.city) qs.set('city', params.city);
      if (params.category && params.category !== 'All') qs.set('category', params.category);
      if (params.search?.trim()) qs.set('search', params.search.trim());
      if (params.lat) qs.set('lat', String(params.lat));
      if (params.lng) qs.set('lng', String(params.lng));
      const res = await fetch(`/api/stores?${qs.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch stores');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Stores fetch failed');
      return (json.stores || []) as any[];
    },
    enabled: params.enabled !== false,
  });
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────

export function useProducts(storeId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products(storeId || ''),
    queryFn: async () => {
      const res = await fetch(`/api/products?store_id=${encodeURIComponent(storeId!)}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      return (json.products || []) as any[];
    },
    enabled: !!storeId,
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productData: Record<string, any>) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Add product failed');
      return json.product;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products(variables.store_id || '') });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productData: Record<string, any> & { id: string }) => {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Update product failed');
      return json.product;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products(variables.store_id || '') });
    },
  });
}

export function useDeleteProduct(storeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Delete product failed');
      return productId;
    },
    onSuccess: () => {
      if (storeId) qc.invalidateQueries({ queryKey: QUERY_KEYS.products(storeId) });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────

export function useOffers(storeId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.offers(storeId || ''),
    queryFn: async () => {
      const url = storeId ? `/api/offers?store_id=${encodeURIComponent(storeId)}` : '/api/offers';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      return (json.offers || []) as any[];
    },
    enabled: !!storeId,
  });
}

export function useAddOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerData: Record<string, any>) => {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Add offer failed');
      return json.offer;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.offers(variables.store_id || '') });
    },
  });
}

export function useDeleteOffer(storeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const res = await fetch(`/api/offers?id=${encodeURIComponent(offerId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Delete offer failed');
      return offerId;
    },
    onSuccess: () => {
      if (storeId) qc.invalidateQueries({ queryKey: QUERY_KEYS.offers(storeId) });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// CONVERSATIONS & MESSAGES
// ─────────────────────────────────────────────────────────────

export function useConversations(storeId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.conversations(storeId || ''),
    queryFn: async () => {
      const url = storeId
        ? `/api/conversations?store_id=${encodeURIComponent(storeId)}`
        : '/api/conversations';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      return (json.conversations || []) as any[];
    },
    enabled: !!storeId,
    refetchInterval: 15_000, // poll every 15s for new conversations
  });
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.messages(conversationId || ''),
    queryFn: async () => {
      const res = await fetch(
        `/api/messages?conversation_id=${encodeURIComponent(conversationId!)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      return (json.messages || []) as any[];
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      conversation_id: string;
      sender_id?: string;
      content: string;
      message_type?: string;
      media_url?: string;
      metadata?: any;
    }) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Send message failed');
      return json.message;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(variables.conversation_id) });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// STORE SYNC (save store profile)
// ─────────────────────────────────────────────────────────────

export function useSyncStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (storeData: Record<string, any>) => {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Store sync failed');
      return json.store;
    },
    onSuccess: (store) => {
      if (store?.id) qc.invalidateQueries({ queryKey: QUERY_KEYS.store(store.id) });
      if (store?.owner_id) qc.invalidateQueries({ queryKey: QUERY_KEYS.store(store.owner_id) });
    },
  });
}
