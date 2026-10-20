export interface DbStore {
  id: string;
  owner_id: string;
  store_name: string;
  category: string;
  business_offering_type: 'product_selling' | 'service_providing' | 'both';
  description?: string;
  address_line: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_live_open: boolean;
  standard_open_time?: string;
  standard_close_time?: string;
  verification_status?: string;
  banner_url?: string;
  logo_url?: string;
  phone_contact?: string;
  whatsapp_number?: string;
  rating?: number;
  total_reviews?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbProduct {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  category?: string;
  image_url?: string;
  is_in_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbOffer {
  id: string;
  store_id: string;
  title: string;
  description: string;
  discount_tag: string;
  banner_image: string;
  valid_until: string;
  radius_km: number;
  is_active: boolean;
  created_at?: string;
}

export interface DbEnquiry {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  category?: string;
  media_url?: string;
  latitude?: number;
  longitude?: number;
  radius_km: number;
  status: string;
  created_at?: string;
  users?: {
    full_name: string;
    phone_number: string;
  };
  hasReplied?: boolean;
  quotedPrice?: number;
}

export interface DbConversation {
  id: string;
  store_id: string;
  customer_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count_merchant?: number;
  unread_count_customer?: number;
  stores?: {
    store_name: string;
    banner_url: string;
  };
  users?: {
    full_name: string;
    phone_number: string;
  };
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'price_quote' | 'location';
  content: string;
  media_url?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  users?: {
    full_name: string;
    role: string;
  };
}

/**
 * Play a crystal-clear gentle notification chime using Web Audio API
 */
export function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant two-tone chime (880Hz -> 1320Hz)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

// -------------------------------------------------------------
// STORES & PRODUCTS
// -------------------------------------------------------------
export async function getStoreWithProducts(storeId?: string, ownerId?: string): Promise<{
  store: DbStore | null;
  products: DbProduct[];
}> {
  try {
    const params = new URLSearchParams();
    if (storeId) params.set('id', storeId);
    if (ownerId) params.set('owner_id', ownerId);
    const qs = params.toString();
    const url = qs ? `/api/store?${qs}` : '/api/store';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { store: null, products: [] };
    const json = await res.json();
    if (json.success && json.store) {
      return { store: json.store, products: json.products || [] };
    }
    return { store: null, products: [] };
  } catch (err) {
    console.error('Error fetching store from API:', err);
    return { store: null, products: [] };
  }
}

export async function syncStoreToSupabase(storeData: Partial<DbStore>): Promise<DbStore | null> {
  try {
    const res = await fetch('/api/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData)
    });
    const json = await res.json();
    return json.success && json.store ? json.store : null;
  } catch (err) {
    console.error('syncStoreToSupabase error:', err);
    return null;
  }
}

export async function addProductToSupabase(productData: Partial<DbProduct>): Promise<DbProduct | null> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const json = await res.json();
    return json.success && json.product ? json.product : null;
  } catch (err) {
    console.error('addProductToSupabase error:', err);
    return null;
  }
}

export async function updateProductInSupabase(productData: Partial<DbProduct> & { id: string }): Promise<DbProduct | null> {
  try {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const json = await res.json();
    return json.success && json.product ? json.product : null;
  } catch (err) {
    console.error('updateProductInSupabase error:', err);
    return null;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('deleteProductFromSupabase error:', err);
    return false;
  }
}

// -------------------------------------------------------------
// OFFERS & DEALS (TAB 3)
// -------------------------------------------------------------
export async function getStoreOffers(storeId?: string): Promise<DbOffer[]> {
  try {
    const url = storeId ? `/api/offers?store_id=${encodeURIComponent(storeId)}` : '/api/offers';
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    return json.success && json.offers ? json.offers : [];
  } catch (err) {
    console.error('getStoreOffers error:', err);
    return [];
  }
}

export async function addOfferToSupabase(offerData: Partial<DbOffer>): Promise<DbOffer | null> {
  try {
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    });
    const json = await res.json();
    return json.success && json.offer ? json.offer : null;
  } catch (err) {
    console.error('addOfferToSupabase error:', err);
    return null;
  }
}

export async function updateOfferInSupabase(offerData: Partial<DbOffer> & { id: string }): Promise<DbOffer | null> {
  try {
    const res = await fetch('/api/offers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    });
    const json = await res.json();
    return json.success && json.offer ? json.offer : null;
  } catch (err) {
    console.error('updateOfferInSupabase error:', err);
    return null;
  }
}

export async function deleteOfferFromSupabase(offerId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/offers?id=${encodeURIComponent(offerId)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('deleteOfferFromSupabase error:', err);
    return false;
  }
}

// -------------------------------------------------------------
// CUSTOMER REVERSE ENQUIRIES (TAB 4)
// -------------------------------------------------------------
export async function getCustomerEnquiries(storeId?: string): Promise<{
  enquiries: DbEnquiry[];
  responses: any[];
}> {
  try {
    const url = storeId ? `/api/enquiries?store_id=${encodeURIComponent(storeId)}` : '/api/enquiries';
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    return {
      enquiries: json.success && json.enquiries ? json.enquiries : [],
      responses: json.success && json.responses ? json.responses : []
    };
  } catch (err) {
    console.error('getCustomerEnquiries error:', err);
    return { enquiries: [], responses: [] };
  }
}

export async function sendEnquiryStockQuote(payload: {
  enquiry_id: string;
  store_id: string;
  price_quote: number;
  note?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('sendEnquiryStockQuote error:', err);
    return false;
  }
}

// -------------------------------------------------------------
// LIVE CONVERSATIONS & SOCKET MESSAGES
// -------------------------------------------------------------
export async function getStoreConversations(storeId?: string): Promise<DbConversation[]> {
  try {
    const url = storeId ? `/api/conversations?store_id=${encodeURIComponent(storeId)}` : '/api/conversations';
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    return json.success && json.conversations ? json.conversations : [];
  } catch (err) {
    console.error('getStoreConversations error:', err);
    return [];
  }
}

export async function getConversationMessages(conversationId: string): Promise<DbMessage[]> {
  try {
    const res = await fetch(`/api/messages?conversation_id=${encodeURIComponent(conversationId)}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    return json.success && json.messages ? json.messages : [];
  } catch (err) {
    console.error('getConversationMessages error:', err);
    return [];
  }
}

export async function sendDirectMessage(payload: {
  conversation_id: string;
  sender_id?: string;
  content: string;
  message_type?: string;
  media_url?: string;
  metadata?: any;
}): Promise<DbMessage | null> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json.success && json.message ? json.message : null;
  } catch (err) {
    console.error('sendDirectMessage error:', err);
    return null;
  }
}

export async function createOrGetConversation(storeId: string, customerId?: string, initialMessage?: string): Promise<DbConversation | null> {
  try {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        customer_id: customerId,
        initial_message: initialMessage
      })
    });
    const json = await res.json();
    return json.success && json.conversation ? json.conversation : null;
  } catch (err) {
    console.error('createOrGetConversation error:', err);
    return null;
  }
}
