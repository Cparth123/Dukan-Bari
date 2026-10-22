'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Store,
  Power,
  MessageSquare,
  Search,
  Tag,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  Plus,
  LogOut,
  Bell,
  Sparkles,
  Phone,
  ArrowRight,
  TrendingUp,
  Percent,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ExternalLink,
  LocateFixed,
  Eye,
  AlertCircle,
  X,
  Layers,
  ShoppingBag,
  Briefcase,
  Check,
  Save,
  RefreshCw,
  Calendar,
  Globe,
  Navigation
} from 'lucide-react';
import { uploadImageToSupabase, SUPABASE_STORE_BUCKET } from '@/lib/storage';
import {
  INDIAN_STATES,
  INDIAN_STATES_DATA,
  detectStateByCity,
  reverseGeocodeGPS,
  formatTo12Hour,
  formatTo24HourInput
} from '@/lib/indiaGeoData';
import {
  syncStoreToSupabase,
  getStoreWithProducts,
  addProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  getStoreOffers,
  addOfferToSupabase,
  updateOfferInSupabase,
  deleteOfferFromSupabase,

  getStoreConversations,
  getConversationMessages,
  sendDirectMessage,
  playNotificationChime,
  DbConversation,
  DbMessage
} from '@/lib/storeService';
import { getSocket, joinConversation, sendChatMessage } from '@/lib/socket';

interface ProductItem {
  id: string;
  name: string;
  itemType: 'product' | 'service';
  categoryTag: string;
  price: number;
  mrp?: number;
  unitOrDuration: string;
  description: string;
  stockStatusText: string;
  inStock: boolean;
  image: string;
}

interface OfferItem {
  id: string;
  title: string;
  discountTag: string;
  validUntil: string;
  radiusKm: number;
  bannerImage: string;
  isActive: boolean;
}



const CATEGORY_OPTIONS = [
  'Grocery & Kirana',
  'Chai Kitli & Nasta Point',
  'Panipuri & Chaat Lari',
  'Pan Masala & Paan Parlour',
  'Mochi & Shoe Repair',
  'Hair Saloon & Men\'s Grooming',
  'Advocate & Legal Services',
  'CA & Tax Advisors',
  'Food, Dhabas & Restaurants',
  'Cycle & Tubeless Tyre Puncture',
  'Chemist & Medical',
  'Dairy, Milk & Bakery',
  'Fruits & Fresh Vegetables',
  'Electronics & Mobile Repair',
  'Other / Custom'
];

export default function DukandarPortal() {
  const { user, profile, role, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // Authentication & Token Verification State
  const [tokenVerified, setTokenVerified] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);

  // Active Tab: 'profile' | 'products' | 'offers' | 'shops' | 'conversations'
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'offers' | 'shops' | 'conversations'>('profile');

  // Real-time Conversation & Notifications State
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<DbConversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<DbMessage[]>([]);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatQuotePrice, setChatQuotePrice] = useState<string>('');
  const [liveAlertNotification, setLiveAlertNotification] = useState<{
    id: string;
    title: string;
    message: string;
    conversationId?: string;
  } | null>(null);

  // 1-Tap Live Store Toggle (OPEN / CLOSED)
  const [isLiveOpen, setIsLiveOpen] = useState(true);

  // Store Profile State (User-wise dynamic)
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).id || '';
      } catch { }
    }
    return '';
  });
  const [storeName, setStoreName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).storeName || '';
      } catch { }
    }
    return '';
  });
  const [category, setCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).category || 'Grocery & Kirana';
      } catch { }
    }
    return 'Grocery & Kirana';
  });
  const [customCategory, setCustomCategory] = useState('');
  const [businessOfferingType, setBusinessOfferingType] = useState<'product_selling' | 'service_providing' | 'both'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).businessOfferingType || 'product_selling';
      } catch { }
    }
    return 'product_selling';
  });
  const [bannerUrl, setBannerUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).bannerUrl || '';
      } catch { }
    }
    return '';
  });
  const [shopPhotoUrl, setShopPhotoUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).logoUrl || '';
      } catch { }
    }
    return '';
  });
  const [addressLine, setAddressLine] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).addressLine || '';
      } catch { }
    }
    return '';
  });
  const [selectedState, setSelectedState] = useState<string>('Gujarat');
  const [city, setCity] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).city || 'Surat';
      } catch { }
    }
    return 'Surat';
  });
  const [customCityMode, setCustomCityMode] = useState<boolean>(false);
  const [pincode, setPincode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).pincode || '395004';
      } catch { }
    }
    return '395004';
  });
  const [latitude, setLatitude] = useState(21.1702);
  const [longitude, setLongitude] = useState(72.8311);
  const [phoneContact, setPhoneContact] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).phoneContact || '';
      } catch { }
    }
    return '';
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dukan_bari_my_store');
        if (raw) return JSON.parse(raw).whatsappNumber || '';
      } catch { }
    }
    return '';
  });
  const [openTime, setOpenTime] = useState('08:30 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [specialScheduleDate, setSpecialScheduleDate] = useState('');
  const [specialScheduleNote, setSpecialScheduleNote] = useState('');
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // -------------------------------------------------------------
  // 1. TOKEN & ACCESS VERIFICATION EFFECT
  // Ensures only authenticated users with valid tokens and merchant/admin
  // roles can access this page. Other users are redirected or denied.
  // -------------------------------------------------------------
  useEffect(() => {
    async function verifyMerchantToken() {
      if (authLoading) return;

      const localToken = typeof window !== 'undefined' ? (localStorage.getItem('dukan_auth_token') || localStorage.getItem('dukan_admin_token')) : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('dukan_auth_user') : null;

      if (!user && !localToken && !storedUser) {
        console.warn('[Merchant Studio] Unauthenticated access attempt. Redirecting to login.');
        router.push('/login?redirect=/merchant');
        return;
      }

      try {
        let hasSession = false;
        if (supabase?.auth) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && session.access_token) {
              hasSession = true;
            }
          } catch {
            // Supabase session check notice
          }
        }

        if (!hasSession && !localToken && !user) {
          console.warn('[Merchant Studio] Session token missing or expired. Redirecting to login.');
          router.push('/login?redirect=/merchant');
          return;
        }

        const userRole = role || profile?.role || (storedUser ? JSON.parse(storedUser)?.role : null);
        // Customer profile cannot access merchant studio
        if (userRole === 'customer') {
          setAccessDenied(true);
          setVerifyingSession(false);
          return;
        }

        setTokenVerified(true);
      } catch (err) {
        console.error('[Merchant Studio] Token verification error:', err);
        if (user || localToken) {
          setTokenVerified(true);
        } else {
          router.push('/login?redirect=/merchant');
        }
      } finally {
        setVerifyingSession(false);
      }
    }

    verifyMerchantToken();
  }, [user, role, profile, authLoading, router]);

  // Image Uploading States
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingShopPhoto, setUploadingShopPhoto] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);
  const [uploadingOfferImg, setUploadingOfferImg] = useState(false);
  const [lastUploadedBucketMsg, setLastUploadedBucketMsg] = useState('');

  // Products & Services State (100% Dynamic - starts empty unless merchant adds products)
  const [products, setProducts] = useState<ProductItem[]>([]);

  // Product Modal State (Add/Edit)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormType, setProdFormType] = useState<'product' | 'service'>('product');
  const [prodFormTag, setProdFormTag] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState<number>(0);
  const [prodFormMrp, setProdFormMrp] = useState<number>(0);
  const [prodFormUnit, setProdFormUnit] = useState('');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormStockStatus, setProdFormStockStatus] = useState('In Stock - Ready at Counter');
  const [prodFormInStock, setProdFormInStock] = useState(true);
  const [prodFormImage, setProdFormImage] = useState('');

  // Offers State (100% Dynamic - starts empty unless merchant creates deals)
  const [offers, setOffers] = useState<OfferItem[]>([]);

  // Offer Modal State (Add/Edit)
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerFormTitle, setOfferFormTitle] = useState('');
  const [offerFormDiscountTag, setOfferFormDiscountTag] = useState('FLAT 20% OFF');
  const [offerFormValidUntil, setOfferFormValidUntil] = useState('8:00 PM Tonight');
  const [offerFormRadiusKm, setOfferFormRadiusKm] = useState(3.0);
  const [offerFormImage, setOfferFormImage] = useState('');
  const [offerFormIsActive, setOfferFormIsActive] = useState(true);

  // Nearby Shops Discovery (for merchant to see other stores)
  const [nearbyShops, setNearbyShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsCategory, setShopsCategory] = useState('All');
  const [shopsSearch, setShopsSearch] = useState('');

  // -------------------------------------------------------------
  // 2. USER-WISE DATA LOADING
  // Loads store, products, offers, enquiries & conversations ONLY
  // for the authenticated user (matching user.id)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!tokenVerified || !user) return;

    let isMounted = true;

    async function loadMerchantData() {
      try {
        let dbStore: any = null;
        let dbProducts: any[] = [];

        // 1. Direct Supabase query (ensures stores?select=*&owner_id=eq... executes immediately)
        if (user?.id) {
          try {
            const { data: supaStore } = await supabase
              .from('stores')
              .select('*')
              .eq('owner_id', user.id)
              .maybeSingle();
            if (supaStore) {
              dbStore = supaStore;
            }
          } catch (supaErr) {
            console.warn('Direct store query notice:', supaErr);
          }
        }

        // 2. Fallback to API route getStoreWithProducts if needed
        if (!dbStore) {
          const apiRes = await getStoreWithProducts(
            profile?.store_id || undefined,
            user?.id
          );
          dbStore = apiRes.store;
          dbProducts = apiRes.products || [];
        } else {
          try {
            const { data: prods } = await supabase
              .from('products')
              .select('*')
              .eq('store_id', dbStore.id)
              .order('created_at', { ascending: false });
            dbProducts = prods || [];
          } catch { }
        }

        if (!isMounted) return;

        if (dbStore) {
          setCurrentStoreId(dbStore.id);
          setStoreName(dbStore.store_name || '');
          setCategory(dbStore.category || 'Grocery & Kirana');
          setBusinessOfferingType(dbStore.business_offering_type || 'service_providing');
          if (dbStore.banner_url) setBannerUrl(dbStore.banner_url);
          if (dbStore.logo_url) setShopPhotoUrl(dbStore.logo_url);
          if (dbStore.address_line) setAddressLine(dbStore.address_line);
          if (dbStore.city) {
            setCity(dbStore.city);
            const foundState = detectStateByCity(dbStore.city);
            if (foundState) setSelectedState(foundState);
          }
          if (dbStore.pincode) setPincode(dbStore.pincode);
          if (dbStore.latitude) setLatitude(Number(dbStore.latitude));
          if (dbStore.longitude) setLongitude(Number(dbStore.longitude));
          if (dbStore.standard_open_time) setOpenTime(formatTo12Hour(dbStore.standard_open_time));
          if (dbStore.standard_close_time) setCloseTime(formatTo12Hour(dbStore.standard_close_time));
          if (dbStore.phone_contact) setPhoneContact(dbStore.phone_contact);
          if (dbStore.whatsapp_number) setWhatsappNumber(dbStore.whatsapp_number);
          setIsLiveOpen(dbStore.is_live_open ?? true);

          // Update local cache
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'dukan_bari_my_store',
              JSON.stringify({
                id: dbStore.id,
                storeName: dbStore.store_name,
                category: dbStore.category,
                businessOfferingType: dbStore.business_offering_type,
                bannerUrl: dbStore.banner_url,
                logoUrl: dbStore.logo_url,
                addressLine: dbStore.address_line,
                city: dbStore.city,
                pincode: dbStore.pincode,
                phoneContact: dbStore.phone_contact,
                whatsappNumber: dbStore.whatsapp_number,
                latitude: Number(dbStore.latitude),
                longitude: Number(dbStore.longitude),
                isLiveOpen: dbStore.is_live_open,
              })
            );
          }

          if (dbProducts && dbProducts.length > 0) {
            setProducts(
              dbProducts.map((p) => ({
                id: p.id,
                name: p.name,
                itemType: dbStore.business_offering_type === 'service_providing' ? 'service' : 'product',
                categoryTag: p.category || dbStore.category,
                price: Number(p.price) || 0,
                mrp: (Number(p.price) || 0) + (Number(p.discount_price) || 0),
                unitOrDuration: '1 Unit',
                description: p.description || '',
                stockStatusText: p.is_in_stock ? 'In Stock - Ready at Counter' : 'Unavailable',
                inStock: p.is_in_stock ?? true,
                image: p.image_url || '/barber-service.jpg'
              }))
            );
          }

          // Load Offers from Supabase
          const dbOffers = await getStoreOffers(dbStore.id);
          if (isMounted && dbOffers && dbOffers.length > 0) {
            setOffers(
              dbOffers.map((o) => ({
                id: o.id,
                title: o.title,
                discountTag: o.discount_tag || 'FLAT 20% OFF',
                validUntil: o.valid_until ? new Date(o.valid_until).toLocaleDateString() : 'Valid Today',
                radiusKm: Number(o.radius_km) || 3.0,
                bannerImage: o.banner_image || '/barber-service.jpg',
                isActive: o.is_active ?? true
              }))
            );
          }



          // Load Conversations from Supabase
          const dbConvs = await getStoreConversations(dbStore.id);
          if (isMounted) {
            setConversations(dbConvs);
            if (dbConvs.length > 0 && !activeConversation) {
              setActiveConversation(dbConvs[0]);
              const msgs = await getConversationMessages(dbConvs[0].id);
              if (isMounted) setConversationMessages(msgs);
            }
          }
        } else {
          // Initialize clean template or fallback from localStorage / profile
          let cachedStore: any = null;
          if (typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('dukan_bari_my_store');
              if (raw) cachedStore = JSON.parse(raw);
            } catch { }
          }

          const fallbackName = cachedStore?.storeName || (profile?.full_name ? `${profile.full_name}'s Dukaan` : '');
          const fallbackPhone = cachedStore?.phoneContact || profile?.phone_number || (user?.user_metadata?.phone_number) || '';
          const fallbackWhatsapp = cachedStore?.whatsappNumber || fallbackPhone;
          const fallbackAddress = cachedStore?.addressLine || '';
          const fallbackCity = cachedStore?.city || 'Surat';
          const fallbackPincode = cachedStore?.pincode || '395004';
          const fallbackCat = cachedStore?.category || 'Grocery & Kirana';

          setCurrentStoreId(cachedStore?.id || '');
          if (fallbackName) setStoreName(fallbackName);
          if (fallbackPhone) setPhoneContact(fallbackPhone);
          if (fallbackWhatsapp) setWhatsappNumber(fallbackWhatsapp);
          if (fallbackAddress) setAddressLine(fallbackAddress);
          if (fallbackCity) setCity(fallbackCity);
          if (fallbackPincode) setPincode(fallbackPincode);
          if (fallbackCat) setCategory(fallbackCat);

          setProducts([]);
          setOffers([]);
          setNearbyShops([]);
          setConversations([]);
        }

        // Initialize Socket.io real-time listeners
        const socket = await getSocket();

        socket.on('receive_message', (msg: any) => {
          // If message is from current logged in user, don't trigger notification or duplicate
          if (user?.id && msg.sender_id === user.id) {
            setConversationMessages((prev) => {
              if (prev.some((m) => m.id === msg.id || (m.content === msg.content && m.sender_id === msg.sender_id))) return prev;
              return [...prev, msg];
            });
            return;
          }

          playNotificationChime();
          setLiveAlertNotification({
            id: msg.id || `${Date.now()}`,
            title: `💬 New Message from ${msg.sender_name || 'Customer'}`,
            message: msg.content || 'Sent an enquiry/order',
            conversationId: msg.conversation_id
          });

          // Append to active conversation if open, preventing duplicates
          setConversationMessages((prev) => {
            if (prev.some((m) => m.id === msg.id || (m.content === msg.content && m.sender_id === msg.sender_id))) return prev;
            return [...prev, msg];
          });

          // Refresh conversations
          const storeIdToRefresh = dbStore?.id || currentStoreId || profile?.store_id;
          if (storeIdToRefresh) {
            getStoreConversations(storeIdToRefresh).then(setConversations);
          }
        });


      } catch (err) {
        console.warn('Could not load merchant data from Supabase:', err);
      }
    }

    loadMerchantData();

    return () => {
      isMounted = false;
    };
  }, [tokenVerified, user, profile?.store_id, profile?.phone_number, profile?.full_name]);

  // Sync to Supabase `stores` table
  const saveStoreProfile = async () => {
    if (!user) {
      alert('Authentication required: please sign in to save store details.');
      router.push('/login?redirect=/merchant');
      return;
    }

    const finalCategory = category === 'Other / Custom' && customCategory.trim() ? customCategory : category;

    const saved = await syncStoreToSupabase({
      id: currentStoreId || undefined,
      owner_id: user.id,
      store_name: storeName.trim() || 'My Local Store',
      category: finalCategory,
      business_offering_type: businessOfferingType,
      banner_url: bannerUrl,
      logo_url: shopPhotoUrl,
      address_line: addressLine,
      city,
      pincode,
      latitude,
      longitude,
      phone_contact: phoneContact,
      whatsapp_number: whatsappNumber,
      is_live_open: isLiveOpen,
      standard_open_time: openTime,
      standard_close_time: closeTime
    });

    if (saved) {
      setCurrentStoreId(saved.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'dukan_bari_my_store',
          JSON.stringify({
            id: saved.id,
            storeName: saved.store_name,
            category: saved.category,
            businessOfferingType: saved.business_offering_type,
            addressLine: saved.address_line,
            city: saved.city,
            pincode: saved.pincode,
            latitude: saved.latitude,
            longitude: saved.longitude,
            phoneContact: saved.phone_contact,
            whatsappNumber: saved.whatsapp_number,
            bannerUrl: saved.banner_url,
            logoUrl: saved.logo_url,
            isLiveOpen: saved.is_live_open,
          })
        );
      }
      setLastUploadedBucketMsg(`✓ Store "${saved.store_name}" saved with live GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})!`);
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Handler when user selects an Indian State from dropdown
  const handleStateSelect = (newState: string) => {
    setSelectedState(newState);
    setCustomCityMode(false);
    const cities = INDIAN_STATES_DATA[newState] || [];
    if (cities.length > 0) {
      const firstCity = cities[0];
      setCity(firstCity.name);
      setPincode(firstCity.pincode);
      setLatitude(firstCity.latitude);
      setLongitude(firstCity.longitude);
    }
  };

  // Handler when user selects a City from the dynamic dropdown
  const handleCitySelect = (val: string) => {
    if (val === '__CUSTOM__') {
      setCustomCityMode(true);
      return;
    }
    setCustomCityMode(false);
    setCity(val);
    const cities = INDIAN_STATES_DATA[selectedState] || [];
    const matched = cities.find((c) => c.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      setPincode(matched.pincode);
      setLatitude(matched.latitude);
      setLongitude(matched.longitude);
    }
  };

  // Real GPS detection handler with reverse-geocoding
  const handleDetectRealGPS = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGPS(true);
    setLastUploadedBucketMsg('🛰️ Contacting device GPS sensor for exact coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracyMeters = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(accuracyMeters);

        // Reverse geocode to find user's real City, State, Pincode
        try {
          const rev = await reverseGeocodeGPS(lat, lng);
          if (rev.state) {
            setSelectedState(rev.state);
          }
          if (rev.city) {
            setCity(rev.city);
          }
          if (rev.pincode) {
            setPincode(rev.pincode);
          }
          if (rev.addressLine && (!addressLine || addressLine.length < 5)) {
            setAddressLine(rev.addressLine);
          }
          setLastUploadedBucketMsg(
            `📍 Real Location Locked! ${rev.city || 'Found'} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) ±${accuracyMeters}m`
          );
        } catch (e) {
          setLastUploadedBucketMsg(`📍 Real GPS Coordinates Locked: ${lat}°N, ${lng}°E (±${accuracyMeters}m)`);
        } finally {
          setIsDetectingGPS(false);
          setTimeout(() => setLastUploadedBucketMsg(''), 6000);
        }
      },
      (err) => {
        setIsDetectingGPS(false);
        console.warn('Geolocation error:', err);
        alert(`Location sensor notice (${err.code}): ${err.message}. If permission was blocked, please enable location in browser settings.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Image upload handler for Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetStoreId = currentStoreId || profile?.store_id || undefined;
    setUploadingBanner(true);
    const res = await uploadImageToSupabase(file, 'banners', {
      existingUrl: bannerUrl,
      customName: targetStoreId ? `store_banner_${targetStoreId}` : undefined,
    });
    setUploadingBanner(false);

    if (res.success && res.url) {
      setBannerUrl(res.url);
      setLastUploadedBucketMsg('✓ Store banner updated successfully!');
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);

      // Auto-save banner_url in database stores table
      try {
        const saved = await syncStoreToSupabase({
          id: targetStoreId,
          owner_id: user?.id,
          banner_url: res.url,
        });
        if (saved?.id) {
          setCurrentStoreId(saved.id);
        }

        if (targetStoreId) {
          await supabase.from('stores').update({ banner_url: res.url }).eq('id', targetStoreId);
        } else if (user?.id) {
          await supabase.from('stores').update({ banner_url: res.url }).eq('owner_id', user.id);
        }

        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('dukan_bari_my_store');
          const prevObj = raw ? JSON.parse(raw) : {};
          localStorage.setItem('dukan_bari_my_store', JSON.stringify({ ...prevObj, bannerUrl: res.url }));
        }
      } catch (saveErr) {
        console.warn('Banner auto-save notice:', saveErr);
      }
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Image upload handler for Shop Front
  const handleShopPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetStoreId = currentStoreId || profile?.store_id || undefined;
    setUploadingShopPhoto(true);
    const res = await uploadImageToSupabase(file, 'stores', {
      existingUrl: shopPhotoUrl,
      customName: targetStoreId ? `store_photo_${targetStoreId}` : undefined,
    });
    setUploadingShopPhoto(false);

    if (res.success && res.url) {
      setShopPhotoUrl(res.url);
      setLastUploadedBucketMsg('✓ Shop photo updated successfully!');
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);

      // Auto-save logo_url in database stores table
      try {
        const saved = await syncStoreToSupabase({
          id: targetStoreId,
          owner_id: user?.id,
          logo_url: res.url,
        });
        if (saved?.id) {
          setCurrentStoreId(saved.id);
        }

        if (targetStoreId) {
          await supabase.from('stores').update({ logo_url: res.url }).eq('id', targetStoreId);
        } else if (user?.id) {
          await supabase.from('stores').update({ logo_url: res.url }).eq('owner_id', user.id);
        }

        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('dukan_bari_my_store');
          const prevObj = raw ? JSON.parse(raw) : {};
          localStorage.setItem('dukan_bari_my_store', JSON.stringify({ ...prevObj, logoUrl: res.url }));
        }
      } catch (saveErr) {
        console.warn('Shop photo auto-save notice:', saveErr);
      }
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Image upload handler for Product modal
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImg(true);
    const res = await uploadImageToSupabase(file, 'products', {
      existingUrl: prodFormImage,
      customName: editingProductId ? `prod_${editingProductId}` : undefined,
    });
    setUploadingProductImg(false);

    if (res.success && res.url) {
      setProdFormImage(res.url);
      setLastUploadedBucketMsg('✓ Product image updated successfully!');
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Image upload handler for Offer modal
  const handleOfferImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOfferImg(true);
    const res = await uploadImageToSupabase(file, 'offers', {
      existingUrl: offerFormImage,
      customName: editingOfferId ? `offer_${editingOfferId}` : undefined,
    });
    setUploadingOfferImg(false);

    if (res.success && res.url) {
      setOfferFormImage(res.url);
      setLastUploadedBucketMsg('✓ Deal banner updated successfully!');
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdFormName('');
    setProdFormType('product');
    setProdFormTag(category);
    setProdFormPrice(100);
    setProdFormMrp(120);
    setProdFormUnit('1 Unit');
    setProdFormDesc('');
    setProdFormStockStatus('In Stock - Ready at Counter');
    setProdFormInStock(true);
    setProdFormImage('/grocery-product.jpg');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProductId(prod.id);
    setProdFormName(prod.name);
    setProdFormType(prod.itemType);
    setProdFormTag(prod.categoryTag);
    setProdFormPrice(prod.price);
    setProdFormMrp(prod.mrp || prod.price);
    setProdFormUnit(prod.unitOrDuration);
    setProdFormDesc(prod.description);
    setProdFormStockStatus(prod.stockStatusText);
    setProdFormInStock(prod.inStock);
    setProdFormImage(prod.image);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    const price = Number(prodFormPrice) || 0;
    const mrp = Number(prodFormMrp) || price;
    const discountAmt = mrp > price ? mrp - price : 0;

    if (editingProductId && editingProductId.length > 20) {
      // Update in Supabase
      const updated = await updateProductInSupabase({
        id: editingProductId,
        name: prodFormName.trim(),
        price,
        discount_price: discountAmt,
        category: prodFormTag || category,
        description: prodFormDesc,
        image_url: prodFormImage,
        is_in_stock: prodFormInStock
      });

      if (updated) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProductId
              ? {
                ...p,
                name: updated.name,
                itemType: prodFormType,
                categoryTag: updated.category || category,
                price: Number(updated.price),
                mrp,
                unitOrDuration: prodFormUnit || '1 Unit',
                description: updated.description || '',
                stockStatusText: prodFormStockStatus,
                inStock: updated.is_in_stock ?? true,
                image: updated.image_url || '/barber-service.jpg'
              }
              : p
          )
        );
      }
    } else {
      // Insert into Supabase
      const inserted = await addProductToSupabase({
        store_id: currentStoreId,
        name: prodFormName.trim(),
        price,
        discount_price: discountAmt,
        category: prodFormTag || category,
        description: prodFormDesc,
        image_url: prodFormImage,
        is_in_stock: prodFormInStock
      });

      if (inserted) {
        const newProd: ProductItem = {
          id: inserted.id,
          name: inserted.name,
          itemType: prodFormType,
          categoryTag: inserted.category || category,
          price: Number(inserted.price),
          mrp,
          unitOrDuration: prodFormUnit || '1 Unit',
          description: inserted.description || '',
          stockStatusText: prodFormStockStatus,
          inStock: inserted.is_in_stock ?? true,
          image: inserted.image_url || '/barber-service.jpg'
        };
        setProducts((prev) => [newProd, ...prev]);
      }
    }

    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const prodToDelete = products.find((p) => p.id === id);
    const prodName = prodToDelete?.name || 'this item';

    if (confirm(`Are you sure you want to delete "${prodName}"?\n\nThis will remove the item from your store catalog.`)) {
      const success = await deleteProductFromSupabase(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setLastUploadedBucketMsg(`✓ "${prodName}" removed from store catalog.`);
        setTimeout(() => setLastUploadedBucketMsg(''), 5000);
      } else {
        alert('Could not delete product. Please try again.');
      }
    }
  };

  // Offer CRUD (Sync to Supabase announcements_and_offers table)
  const handleOpenAddOffer = () => {
    setEditingOfferId(null);
    setOfferFormTitle('');
    setOfferFormDiscountTag('FLAT 25% OFF');
    setOfferFormValidUntil('Valid for 7 Days');
    setOfferFormRadiusKm(3.5);
    setOfferFormImage('/barber-service.jpg');
    setOfferFormIsActive(true);
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (offer: OfferItem) => {
    setEditingOfferId(offer.id);
    setOfferFormTitle(offer.title);
    setOfferFormDiscountTag(offer.discountTag);
    setOfferFormValidUntil(offer.validUntil);
    setOfferFormRadiusKm(offer.radiusKm);
    setOfferFormImage(offer.bannerImage);
    setOfferFormIsActive(offer.isActive);
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFormTitle.trim()) return;

    if (editingOfferId && editingOfferId.length > 20) {
      const updated = await updateOfferInSupabase({
        id: editingOfferId,
        title: offerFormTitle.trim(),
        discount_tag: offerFormDiscountTag,
        banner_image: offerFormImage,
        radius_km: Number(offerFormRadiusKm),
        is_active: offerFormIsActive
      });

      if (updated) {
        setOffers((prev) =>
          prev.map((o) =>
            o.id === editingOfferId
              ? {
                ...o,
                title: updated.title,
                discountTag: updated.discount_tag,
                bannerImage: updated.banner_image,
                radiusKm: Number(updated.radius_km),
                isActive: updated.is_active
              }
              : o
          )
        );
        setLastUploadedBucketMsg('✓ Deal updated successfully!');
        setTimeout(() => setLastUploadedBucketMsg(''), 4000);
      }
    } else {
      const inserted = await addOfferToSupabase({
        store_id: currentStoreId,
        title: offerFormTitle.trim(),
        description: 'Neighborhood Special Deal',
        discount_tag: offerFormDiscountTag,
        banner_image: offerFormImage,
        radius_km: Number(offerFormRadiusKm),
        is_active: offerFormIsActive
      });

      if (inserted) {
        const newOffer: OfferItem = {
          id: inserted.id,
          title: inserted.title,
          discountTag: inserted.discount_tag,
          validUntil: offerFormValidUntil,
          radiusKm: Number(inserted.radius_km),
          bannerImage: inserted.banner_image,
          isActive: inserted.is_active
        };
        setOffers((prev) => [newOffer, ...prev]);
        setLastUploadedBucketMsg('✓ New deal published successfully!');
        setTimeout(() => setLastUploadedBucketMsg(''), 4000);
      }
    }

    setShowOfferModal(false);
  };

  const handleDeleteOffer = async (id: string) => {
    const offerToDelete = offers.find((o) => o.id === id);
    const offerTitle = offerToDelete?.title || 'this offer';

    if (confirm(`Are you sure you want to delete "${offerTitle}"?\n\nThis will remove the deal and promotional banner.`)) {
      const success = await deleteOfferFromSupabase(id);
      if (success) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
        setLastUploadedBucketMsg(`✓ "${offerTitle}" was removed successfully.`);
        setTimeout(() => setLastUploadedBucketMsg(''), 5000);
      } else {
        alert('Could not delete offer. Please try again.');
      }
    }
  };

  const handleToggleOfferActive = async (offer: OfferItem) => {
    const nextStatus = !offer.isActive;
    await updateOfferInSupabase({ id: offer.id, is_active: nextStatus });
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, isActive: nextStatus } : o)));
  };

  // Load nearby shops for merchant discovery tab
  const loadNearbyShops = async () => {
    setShopsLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (shopsCategory && shopsCategory !== 'All') params.set('category', shopsCategory);
      if (shopsSearch.trim()) params.set('search', shopsSearch.trim());
      if (latitude) params.set('lat', String(latitude));
      if (longitude) params.set('lng', String(longitude));
      const res = await fetch(`/api/stores?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        // Filter out own store
        setNearbyShops((json.stores || []).filter((s: any) => s.id !== currentStoreId));
      }
    } catch (err) {
      console.error('loadNearbyShops error:', err);
    } finally {
      setShopsLoading(false);
    }
  };

  // Select conversation to view messages
  const handleSelectConversation = async (conv: DbConversation) => {
    setActiveConversation(conv);
    const msgs = await getConversationMessages(conv.id);
    setConversationMessages(msgs);
    await joinConversation(conv.id);
  };

  // Send message from merchant to customer
  const handleSendMerchantMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || (!chatMessageText.trim() && !chatQuotePrice)) return;

    let content = chatMessageText.trim();
    let msgType = 'text';
    let metadata: any = {};

    if (chatQuotePrice && Number(chatQuotePrice) > 0) {
      msgType = 'price_quote';
      metadata = { quoted_price: Number(chatQuotePrice) };
      content = content || `Counter Price Quote: ₹${chatQuotePrice}`;
    }

    const newMsg = await sendDirectMessage({
      conversation_id: activeConversation.id,
      sender_id: user?.id,
      content,
      message_type: msgType,
      metadata
    });

    if (newMsg) {
      setConversationMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setChatMessageText('');
      setChatQuotePrice('');
      await sendChatMessage({
        conversationId: activeConversation.id,
        content,
        messageType: msgType as any,
        metadata,
        senderId: user?.id,
        messageId: newMsg.id
      });
    }
  };

  // -------------------------------------------------------------
  // ACCESS CONTROL & TOKEN VERIFICATION GUARDS
  // -------------------------------------------------------------
  if (authLoading || verifyingSession) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="w-10 h-10 text-[#2874f0] animate-spin" />
        <h2 className="text-lg font-black text-slate-800">
          Verifying Merchant Token & Security Access...
        </h2>
        <p className="text-xs text-slate-500">
          Validating authenticated merchant credentials and counter privileges...
        </p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Merchant Access Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your account (<span className="font-semibold text-slate-800">{user?.email || profile?.full_name}</span>) is currently signed in with a <strong className="text-[#2874f0] font-black uppercase">Customer</strong> profile.
              The Merchant Studio is exclusively for verified Shopkeepers, Vendors, and Service Providers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/signup?role=shop_owner"
              className="w-full py-2.5 px-4 bg-[#2874f0] hover:bg-[#1a5bc7] text-white text-xs font-black rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Register as Dukandar / Merchant (0% Fee)</span>
            </Link>

            <Link
              href="/explore"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Nearby Stores (Customer Feed)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={async () => {
                await signOut();
                router.push('/login?redirect=/merchant');
              }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Switch Account / Sign In with Merchant Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenVerified || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans">
      {/* 1. Merchant Dashboard Header */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-[#2874f0] flex items-center justify-center font-black shadow">
                <Store className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-lg font-black italic tracking-tight text-white">Dukan Bari</span>
                <span className="text-[10px] block text-[#ffe500] font-black">
                  Merchant & Store Owner Studio
                </span>
              </div>
            </Link>


          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* View Live Storefront Button (Links directly to dynamic Supabase store) */}
            {/* <Link
              href={currentStoreId ? `/store/${currentStoreId}` : '/store/my-store'}
              target="_blank"
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors border border-white/20"
              title="Open public customer view of this store"
            >
              <Eye className="w-3.5 h-3.5 text-[#ffe500]" />
              <span className="hidden sm:inline">View Live Storefront</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link> */}

            {/* Authenticated Merchant Identity Badge */}
            <div className="hidden md:flex flex-col text-right leading-tight">
              <span className="text-[11px] font-black text-white truncate max-w-[150px]">
                {profile?.full_name || user?.email?.split('@')[0] || 'Merchant'}
              </span>
              <span className="text-[9px] text-[#ffe500] font-bold uppercase tracking-wider">
                {role === 'superadmin' ? 'Superadmin' : 'Verified Dukandar'}
              </span>
            </div>

            {/* Live Open / Closed 1-Tap Toggle (Syncs to Supabase) */}
            <button
              onClick={async () => {
                const nextStatus = !isLiveOpen;
                setIsLiveOpen(nextStatus);
                if (currentStoreId) {
                  await syncStoreToSupabase({
                    id: currentStoreId,
                    owner_id: user?.id,
                    is_live_open: nextStatus
                  });
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm ${isLiveOpen
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300'
                : 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-300'
                }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isLiveOpen ? '🟢 LIVE OPEN' : '🔴 CLOSED'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={async () => {
                await signOut();
                router.push('/login?redirect=/merchant');
              }}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Upload Notification Toast */}
      {lastUploadedBucketMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center justify-between animate-fadeInUp">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>{lastUploadedBucketMsg}</span>
            </div>
            <button onClick={() => setLastUploadedBucketMsg('')} className="text-white hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Real-time Socket Audio Alert & Notification Banner */}
      {liveAlertNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center justify-between animate-fadeInUp border border-blue-400/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Bell className="w-5 h-5 text-[#ffe500]" />
              </div>
              <div>
                <div className="text-sm font-black text-white">{liveAlertNotification.title}</div>
                <div className="text-xs text-blue-100 mt-0.5">{liveAlertNotification.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('conversations');
                  if (liveAlertNotification.conversationId) {
                    const target = conversations.find((c) => c.id === liveAlertNotification.conversationId);
                    if (target) handleSelectConversation(target);
                  }
                  setLiveAlertNotification(null);
                }}
                className="bg-[#ffe500] hover:bg-amber-300 text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-md shadow transition-colors flex items-center gap-1.5"
              >
                <span>Open Live Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLiveAlertNotification(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Studio Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1 mb-6 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'profile'
              ? 'bg-[#2874f0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Store className="w-4 h-4" />
            <span>1. Store Profile & Location</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'products'
              ? 'bg-[#2874f0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>2. Products & Services ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'offers'
              ? 'bg-[#2874f0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Percent className="w-4 h-4" />
            <span>3. Deals & Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('shops'); loadNearbyShops(); }}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${activeTab === 'shops'
              ? 'bg-[#2874f0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Store className="w-4 h-4" />
            <span>4. Nearby Shops ({nearbyShops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all relative ${activeTab === 'conversations'
              ? 'bg-[#2874f0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Bell className="w-4 h-4" />
            <span>5. Live Customer Chats ({conversations.length})</span>
            {conversations.some((c) => (c.unread_count_merchant || 0) > 0) && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: STORE PROFILE, BANNER, SHOP PHOTO & GPS LOCATION */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              {/* Store Banner with Live Supabase Upload */}
              <div className="relative w-full h-48 sm:h-64 bg-slate-900 overflow-hidden group">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl}
                    alt={storeName || 'Store Banner'}
                    fill
                    unoptimized={bannerUrl.startsWith('http')}
                    className="object-cover opacity-90 group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-2.5 border border-white/20">
                      <ImageIcon className="w-7 h-7 text-[#ffe500]" />
                    </div>
                    <h3 className="text-sm font-black text-white">No Banner Image Uploaded Yet</h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm">
                      Upload your shop front photo or store banner. It stores directly in Supabase <code className="text-[#ffe500]">Store</code> basket.
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* Banner Upload Button */}
                <div className="absolute bottom-4 right-4 z-20">
                  <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-900 text-xs font-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all backdrop-blur-xs border border-white/40">
                    <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                    <span>{uploadingBanner ? 'Uploading to Store Bucket...' : 'Change Store Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Store Core Information Form */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Store Profile & Digital Identity</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All images are dynamically saved in your Supabase storage basket (<code className="font-mono text-[#2874f0]">Store</code>).
                    </p>
                  </div>

                  <button
                    onClick={saveStoreProfile}
                    className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-all"
                  >
                    {profileSaved ? <Check className="w-4 h-4 text-[#ffe500]" /> : <Save className="w-4 h-4" />}
                    <span>{profileSaved ? 'Saved Successfully!' : 'Save Store Profile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Name */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Store / Business Name *
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Gupta General Store, Radhe Chaat Lari, Sharma Advocates"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Business Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {category === 'Other / Custom' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter your custom business category"
                        className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                    )}
                  </div>

                  {/* Business Offering Type */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Offering Type *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setBusinessOfferingType('product_selling')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${businessOfferingType === 'product_selling'
                          ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Selling Items</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBusinessOfferingType('service_providing')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${businessOfferingType === 'service_providing'
                          ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Services/Advice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBusinessOfferingType('both')}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${businessOfferingType === 'both'
                          ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Both (Hybrid)</span>
                      </button>
                    </div>
                  </div>

                  {/* Shop Front Display Photo Upload */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Store Display Photo / Entrance
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                        {shopPhotoUrl ? (
                          <Image src={shopPhotoUrl} alt="Store Photo" fill unoptimized={shopPhotoUrl.startsWith('http')} className="object-cover" />
                        ) : (
                          <Store className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300">
                        <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                        <span>{uploadingShopPhoto ? 'Uploading...' : 'Upload Photo to Supabase'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleShopPhotoUpload}
                          disabled={uploadingShopPhoto}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Calling Contact */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Primary Phone Contact *
                    </label>
                    <input
                      type="tel"
                      value={phoneContact}
                      onChange={(e) => setPhoneContact(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                    />
                  </div>

                  {/* WhatsApp Ordering Number */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      WhatsApp Ordering & Live Chat Number *
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                    />
                  </div>

                  {/* Standard Working Hours & Schedule Date Picker */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                        <span>Daily Store Working Hours</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-xs">
                        {openTime} – {closeTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Opening Time (Counter Opens)
                        </span>
                        <input
                          type="time"
                          value={formatTo24HourInput(openTime)}
                          onChange={(e) => setOpenTime(formatTo12Hour(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-[#2874f0] shadow-xs cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Closing Time (Counter Closes)
                        </span>
                        <input
                          type="time"
                          value={formatTo24HourInput(closeTime)}
                          onChange={(e) => setCloseTime(formatTo12Hour(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-black focus:outline-none focus:border-[#2874f0] shadow-xs cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Presets:</span>
                      {[
                        { label: '8:30 AM - 10 PM', o: '08:30 AM', c: '10:00 PM' },
                        { label: '9:00 AM - 9 PM', o: '09:00 AM', c: '09:00 PM' },
                        { label: '10:00 AM - 8 PM', o: '10:00 AM', c: '08:00 PM' },
                        { label: '24 Hours Open', o: '12:00 AM', c: '11:59 PM' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setOpenTime(preset.o);
                            setCloseTime(preset.c);
                          }}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors ${openTime === preset.o && closeTime === preset.c
                            ? 'bg-[#2874f0] text-white border-[#2874f0]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Special Schedule / Holiday Date Picker */}
                    <div className="border-t border-slate-200 pt-2.5 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Special Operating Date / Festive Schedule (Date Picker)</span>
                        </label>
                        {specialScheduleDate && (
                          <button
                            type="button"
                            onClick={() => {
                              setSpecialScheduleDate('');
                              setSpecialScheduleNote('');
                            }}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Clear Date
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={specialScheduleDate}
                          onChange={(e) => setSpecialScheduleDate(e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#2874f0] shadow-xs cursor-pointer"
                        />
                        <input
                          type="text"
                          value={specialScheduleNote}
                          onChange={(e) => setSpecialScheduleNote(e.target.value)}
                          placeholder="e.g. Diwali Timing (10 AM - 2 PM) or Closed"
                          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#2874f0] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* State, Dynamic City Dropdown & Pincode */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#2874f0]" />
                        <span>State, City & Pincode *</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Dynamic City & Pincode Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {/* State Dropdown */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Select State *
                        </label>
                        <select
                          value={selectedState}
                          onChange={(e) => handleStateSelect(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] shadow-xs cursor-pointer"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic City Dropdown */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Select City ({selectedState}) *
                          </label>
                          {customCityMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomCityMode(false);
                                const cities = INDIAN_STATES_DATA[selectedState] || [];
                                if (cities.length > 0) handleCitySelect(cities[0].name);
                              }}
                              className="text-[10px] text-[#2874f0] font-bold hover:underline"
                            >
                              Show List
                            </button>
                          )}
                        </div>

                        {!customCityMode ? (
                          <select
                            value={city}
                            onChange={(e) => handleCitySelect(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] shadow-xs cursor-pointer"
                          >
                            {(INDIAN_STATES_DATA[selectedState] || []).map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name} (Pin: {c.pincode})
                              </option>
                            ))}
                            <option value="__CUSTOM__">✨ Other / Enter Custom City...</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Type City or Town Name"
                              className="w-full bg-white border border-[#2874f0] rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none shadow-xs"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      {/* Pincode Input */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          6-Digit Pincode *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 395004"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#2874f0] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & GPS Section */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 p-3.5 rounded-xl">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-[#2874f0]" />
                        <span>Store Physical Address & GPS Radar Coordinates</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Get device real GPS location to automatically set latitude & longitude for customer radar discovery.
                      </p>
                      {gpsAccuracy !== null && (
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>GPS Sensor Locked: ±{gpsAccuracy}m precision</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleDetectRealGPS}
                        disabled={isDetectingGPS}
                        className="flex-1 sm:flex-initial bg-[#2874f0] hover:bg-[#1b5ec2] text-white px-4 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-70 cursor-pointer"
                      >
                        {isDetectingGPS ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Locating Device...</span>
                          </>
                        ) : (
                          <>
                            <LocateFixed className="w-4 h-4" />
                            <span>Get Real GPS Location</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        title="View pin on Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Map</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                      Full Physical Address (Street / Landmark / Sector)
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Shop 14, Main Market, Near Shiv Mandir, Sector 5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-black text-slate-600">
                          Latitude (Lat)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Degrees N</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-black text-slate-600">
                          Longitude (Lng)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Degrees E</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveStoreProfile}
                    className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition-all"
                  >
                    {profileSaved ? <Check className="w-4 h-4 text-[#ffe500]" /> : <Save className="w-4 h-4" />}
                    <span>{profileSaved ? 'Profile Updated!' : 'Save All Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS & SERVICES CATALOG CRUD */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Products & Services Catalog</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add items, upload photos directly to Supabase (<code className="font-mono text-[#2874f0]">Store</code> bucket), set prices, MRP & stock status.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Item / Service</span>
                </button>
              </div>

              {/* Product Grid or Empty State */}
              {products.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 my-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#2874f0] flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Your Store Catalog is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    No default dummy items. Add your real products or services with pricing, descriptions, stock availability, and upload photos to Supabase Storage.
                  </p>
                  <button
                    onClick={handleOpenAddProduct}
                    className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-md inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Product / Service</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {products.map((item) => {
                    const discount = item.mrp && item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl p-3.5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative w-full h-36 rounded-lg bg-slate-100 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill unoptimized={item.image.startsWith('http')} className="object-cover" />
                            ) : (
                              <ShoppingBag className="w-10 h-10 text-slate-300" />
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                {item.itemType === 'service' ? 'SERVICE' : 'PRODUCT'}
                              </span>
                              {discount > 0 && (
                                <span className="bg-[#ffe500] text-[#2874f0] text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-2 right-2">
                              <span
                                className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow ${item.inStock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                  }`}
                              >
                                {item.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Title & Tag */}
                          <span className="text-[10px] font-bold text-[#2874f0] block uppercase tracking-wider">
                            {item.categoryTag}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 line-clamp-2 mt-0.5">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Pricing and Actions */}
                        <div className="pt-3 border-t border-slate-100 mt-3">
                          <div className="flex items-baseline justify-between mb-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                              {item.mrp && item.mrp > item.price && (
                                <span className="text-[10px] text-slate-400 line-through">₹{item.mrp}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold">{item.unitOrDuration}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(item)}
                              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-[#2874f0]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DEALS & OFFERS CRUD */}
        {/* ========================================================= */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Active Deals & Flash Announcements</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Broadcast limited-time discounts to nearby residents on the radar. Upload deal creative to Supabase bucket.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddOffer}
                  className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Offer</span>
                </button>
              </div>

              {/* Offers List or Empty State */}
              {offers.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 my-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Percent className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">No Active Deals or Offers</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                    No default deals. Create your own flash discount, festival offer, or counter perks for shoppers in your 1-5km neighborhood.
                  </p>
                  <button
                    onClick={handleOpenAddOffer}
                    className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-md inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Offer</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative w-full h-32 rounded-lg bg-slate-900 overflow-hidden mb-3 flex items-center justify-center">
                          {offer.bannerImage ? (
                            <Image src={offer.bannerImage} alt={offer.title} fill unoptimized={offer.bannerImage.startsWith('http')} className="object-cover opacity-85" />
                          ) : (
                            <Percent className="w-10 h-10 text-slate-500" />
                          )}
                          <div className="absolute top-2 left-2 bg-[#ffe500] text-[#2874f0] text-xs font-black px-2 py-0.5 rounded shadow">
                            {offer.discountTag}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full ${offer.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                                }`}
                            >
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 line-clamp-2">{offer.title}</h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Valid: {offer.validUntil}</span>
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Radar Reach: {offer.radiusKm} km</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
                        <button
                          onClick={() => {
                            const updated = offers.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o));
                            setOffers(updated);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('dukan_bari_my_offers', JSON.stringify(updated));
                            }
                          }}
                          className={`text-xs font-bold px-2.5 py-1 rounded transition-colors ${offer.isActive ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                        >
                          {offer.isActive ? 'Turn Off' : 'Turn On'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditOffer(offer)}
                            className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-[#2874f0]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: NEARBY SHOPS DISCOVERY */}
        {/* ========================================================= */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-5 mb-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2874f0] flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Nearby Shops in {city}</h2>
                      <p className="text-xs text-slate-500">Browse other local stores in your area</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Search shops..."
                      value={shopsSearch}
                      onChange={(e) => setShopsSearch(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2874f0] w-36"
                    />
                    <select
                      value={shopsCategory}
                      onChange={(e) => setShopsCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2874f0]"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                      onClick={loadNearbyShops}
                      disabled={shopsLoading}
                      className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${shopsLoading ? 'animate-spin' : ''}`} />
                      <span>{shopsLoading ? 'Loading...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {shopsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm font-bold">Loading nearby shops...</p>
                </div>
              ) : nearbyShops.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2874f0] flex items-center justify-center mx-auto mb-3">
                    <Store className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">No Shops Found Nearby</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    No other registered shops found in {city}. Try changing the city in your store profile or refreshing.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyShops.map((shop) => (
                    <div key={shop.id} className="border border-slate-200 rounded-xl overflow-hidden bg-[#f8fafc] hover:shadow-md hover:border-blue-200 transition-all group">
                      {/* Banner */}
                      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                        {shop.bannerImg && shop.bannerImg !== '/gupta-store.jpg' ? (
                          <img src={shop.bannerImg} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-10 h-10 text-blue-300" />
                          </div>
                        )}
                        <div className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${shop.isLiveOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {shop.isLiveOpen ? '● OPEN' : '● CLOSED'}
                        </div>
                        {shop.logoImg && (
                          <div className="absolute bottom-0 left-3 translate-y-1/2">
                            <img src={shop.logoImg} alt="logo" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 pt-5">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-sm font-black text-slate-900 truncate">{shop.name}</h4>
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 shadow-xs">
                            <span>{shop.rating || 5.0}</span>
                            <span className="text-[8px]">★</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[#2874f0] font-bold">{shop.category}</span>
                          {Boolean(shop.reviewsCount && shop.reviewsCount > 0) && (
                            <span className="text-slate-400 font-medium text-[10px]">({shop.reviewsCount} reviews)</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />{shop.address}, {shop.city}
                        </p>
                        {shop.activeDeal && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            🏷 {shop.activeDeal}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{shop.openTime} - {shop.closeTime}</span>
                          </div>
                          <a
                            href={`/store/${shop.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-black text-[#2874f0] hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> View Store
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: LIVE CUSTOMER CHATS & REAL-TIME SOCKET MESSAGING */}
        {/* ========================================================= */}
        {activeTab === 'conversations' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
              {/* Left Pane: Conversation List */}
              <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#2874f0]" />
                      <span>Live Customer Chats</span>
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-[#2874f0]">
                      {conversations.length} Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real-time shopper enquiries & direct store counter negotiations.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-bold text-slate-600">No active conversations yet</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        When shoppers message your storefront, they appear here live.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isSelected = activeConversation?.id === conv.id;
                      const customerTitle = conv.users?.full_name || 'Customer Shopper';
                      const customerPhone = conv.users?.phone_number || '';
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${isSelected
                            ? 'bg-blue-50/80 border-l-4 border-l-[#2874f0]'
                            : 'hover:bg-slate-100/70 border-l-4 border-l-transparent'
                            }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2874f0] to-blue-400 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                            {customerTitle.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h4 className="text-xs font-black text-slate-900 truncate">
                                {customerTitle}
                              </h4>
                              {conv.last_message_at && (
                                <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                                  {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            {customerPhone && (
                              <p className="text-[10px] text-slate-400 font-medium truncate mb-1">
                                📞 {customerPhone}
                              </p>
                            )}
                            <p className="text-xs text-slate-600 truncate font-medium">
                              {conv.last_message || 'Started a conversation'}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Pane: Active Chat Room */}
              <div className="md:col-span-8 flex flex-col bg-white">
                {activeConversation ? (
                  <>
                    {/* Chat Room Top Bar */}
                    <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2874f0] text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {(activeConversation.users?.full_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">
                              {activeConversation.users?.full_name || 'Shopper Customer'}
                            </h4>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600">Active</span>
                          </div>

                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeConversation.users?.phone_number && (
                          <a
                            href={`tel:${activeConversation.users.phone_number}`}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc] max-h-[460px]">
                      {conversationMessages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs font-bold text-slate-600">No messages in this chat yet</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Send a greeting or offer a counter price quote below.
                          </p>
                        </div>
                      ) : (
                        conversationMessages.map((msg) => {
                          const isMerchant = msg.sender_id !== activeConversation.customer_id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-xs ${isMerchant
                                  ? 'bg-[#2874f0] text-white rounded-br-xs'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                                  }`}
                              >
                                {msg.message_type === 'price_quote' ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-[#ffe500]">
                                      <Tag className="w-3.5 h-3.5" />
                                      <span>Counter Price Quote</span>
                                    </div>
                                    <div className="text-base font-black">
                                      ₹{msg.metadata?.quoted_price || msg.content}
                                    </div>
                                    {msg.content && msg.content !== `Counter Price Quote: ₹${msg.metadata?.quoted_price}` && (
                                      <p className="text-xs opacity-90">{msg.content}</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 px-1">
                                {msg.created_at
                                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : 'Just now'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input & Fast Quote Sender */}
                    <form onSubmit={handleSendMerchantMessage} className="p-3 border-t border-slate-200 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#2874f0]" />
                          <span>Attach Counter Quote:</span>
                        </span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-500">₹</span>
                          <input
                            type="number"
                            placeholder="Price (optional)"
                            value={chatQuotePrice}
                            onChange={(e) => setChatQuotePrice(e.target.value)}
                            className="w-32 bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type reply or negotiate with customer..."
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                        />
                        <button
                          type="submit"
                          disabled={!chatMessageText.trim() && !chatQuotePrice}
                          className="bg-[#2874f0] hover:bg-[#1759c9] disabled:opacity-40 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2874f0] flex items-center justify-center mb-3">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-black text-slate-800">Direct Shopper Messaging</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Select a conversation on the left to start live negotiations, confirm counter stock, or send instant discounted price quotes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT & SERVICE */}
      {/* ========================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#2874f0]" />
                <span>{editingProductId ? 'Edit Product / Service' : 'Add New Product / Service'}</span>
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Type Switch */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Item Nature *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProdFormType('product')}
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-colors ${prodFormType === 'product'
                      ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    📦 Physical Product (Atta, Oil, Paan, etc.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdFormType('service')}
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-colors ${prodFormType === 'service'
                      ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    💼 Service / Consultation (Lawyer, CA, Saloon)
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Item / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  placeholder="e.g. Aashirwaad Chakki Atta 10kg OR Legal Consultation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                />
              </div>

              {/* Image Upload to Supabase Storage Bucket Store */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Product / Service Photo (Supabase Storage: <code className="text-[#2874f0] lowercase font-mono">Store</code> bucket)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                    {prodFormImage ? (
                      <Image src={prodFormImage} alt="Preview" fill unoptimized={prodFormImage.startsWith('http')} className="object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                    <span>{uploadingProductImg ? 'Uploading to Store Bucket...' : prodFormImage ? 'Change Image' : 'Upload Image to Supabase'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingProductImg}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Price, MRP, Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={prodFormMrp}
                    onChange={(e) => setProdFormMrp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Unit / Pack
                  </label>
                  <input
                    type="text"
                    value={prodFormUnit}
                    onChange={(e) => setProdFormUnit(e.target.value)}
                    placeholder="e.g. 10 kg, 30 Mins"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Category Tag & Stock Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={prodFormTag}
                    onChange={(e) => setProdFormTag(e.target.value)}
                    placeholder="e.g. Flours & Grains, Consultation"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Stock Availability
                  </label>
                  <select
                    value={prodFormStockStatus}
                    onChange={(e) => {
                      setProdFormStockStatus(e.target.value);
                      setProdFormInStock(!e.target.value.toLowerCase().includes('out of stock'));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="In Stock - Ready at Counter">In Stock - Ready at Counter</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Hot & Fresh (Chef Special)">Hot & Fresh (Chef Special)</option>
                    <option value="Available Slot (Walk-in Welcome)">Available Slot (Walk-in Welcome)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={2}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="Provide details about quality, ingredients, brand, or service consultation terms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-black bg-[#2874f0] hover:bg-[#1759c9] text-white shadow-sm"
                >
                  {editingProductId ? 'Update Item' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT OFFER & ANNOUNCEMENT */}
      {/* ========================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#2874f0]" />
                <span>{editingOfferId ? 'Edit Deal / Announcement' : 'Create New Flash Deal'}</span>
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              {/* Offer Title */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Deal Title *
                </label>
                <input
                  type="text"
                  required
                  value={offerFormTitle}
                  onChange={(e) => setOfferFormTitle(e.target.value)}
                  placeholder="e.g. FLAT 15% OFF on Dal & Pulses OR Free Delivery"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2874f0] focus:bg-white"
                />
              </div>

              {/* Discount Tag & Valid Until */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Badge Tag *
                  </label>
                  <input
                    type="text"
                    value={offerFormDiscountTag}
                    onChange={(e) => setOfferFormDiscountTag(e.target.value)}
                    placeholder="e.g. FLAT 20% OFF, BUY 1 GET 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Valid Until
                  </label>
                  <input
                    type="text"
                    value={offerFormValidUntil}
                    onChange={(e) => setOfferFormValidUntil(e.target.value)}
                    placeholder="e.g. 9:00 PM Tonight"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Radar Radius */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Radar Notification Radius (km): {offerFormRadiusKm} km
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={offerFormRadiusKm}
                  onChange={(e) => setOfferFormRadiusKm(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Offer Banner Image Upload to Supabase */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Offer Banner Image (Supabase: <code className="text-[#2874f0] font-mono">Store</code> bucket)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                    {offerFormImage ? (
                      <Image src={offerFormImage} alt="Offer Preview" fill unoptimized={offerFormImage.startsWith('http')} className="object-cover" />
                    ) : (
                      <Percent className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg border border-slate-300 flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                    <span>{uploadingOfferImg ? 'Uploading...' : offerFormImage ? 'Change Banner' : 'Upload Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOfferImageUpload}
                      disabled={uploadingOfferImg}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-black bg-[#2874f0] hover:bg-[#1759c9] text-white shadow-sm"
                >
                  {editingOfferId ? 'Update Deal' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
