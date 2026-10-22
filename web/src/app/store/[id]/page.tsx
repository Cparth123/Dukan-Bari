'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Search,
  ArrowLeft,
  CheckCircle,
  Tag,
  Star,
  Sparkles,
  Plus,
  X,
  ShoppingBag,
  Navigation2,
  ShieldCheck,
  Edit2,
  Trash2,
  Upload,
  Power,
  Save,
  RefreshCw,
  AlertCircle,
  Lock
} from 'lucide-react';
import { uploadImageToSupabase, SUPABASE_STORE_BUCKET } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import {
  getStoreWithProducts,
  syncStoreToSupabase,
  addProductToSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  createOrGetConversation,
  getConversationMessages,
  sendDirectMessage,
  playNotificationChime,
  DbStore,
  DbProduct
} from '@/lib/storeService';
import { getSocket, joinConversation, sendChatMessage } from '@/lib/socket';


export interface CatalogItem {
  id: string;
  name: string;
  categoryTag: string;
  price: number;
  mrp?: number;
  discountPercent?: number;
  unitOrDuration: string;
  description: string;
  inStock: boolean;
  stockStatusText?: string;
  itemType: 'product' | 'service';
  image: string;
  specs?: string[];
}

export interface StoreBusinessData {
  id: string;
  ownerId?: string;
  name: string;
  businessType: 'retail' | 'legal_advocate' | 'tax_advisor' | 'restaurant_food' | 'pharmacy';
  category: string;
  badgeTitle: string;
  address: string;
  city: string;
  pincode: string;
  distanceKm: number;
  walkMinutes: number;
  rating: number;
  reviewsCount: number;
  isLiveOpen: boolean;
  statusBadge: string;
  badgeBg: string;
  bannerImg: string;
  phone: string;
  whatsapp: string;
  activeDeal?: string;
  workingHours: string;
  aboutText: string;
  catalog: CatalogItem[];
}

export default function StoreDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const storeIdParam = (params?.id as string) || '';
  const initialSelectedProduct = searchParams?.get('product') || '';

  // Auth Context: Check logged in user and client role
  const { user, profile, role, loading: authLoading } = useAuth();
  const [authVerified, setAuthVerified] = useState(false);

  // Guard: Without login don't show shop details and list page
  useEffect(() => {
    if (authLoading) return;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('dukan_auth_token') || localStorage.getItem('dukan_admin_token')) : null;
    const hasActiveUser = Boolean(token && (user || profile || localStorage.getItem('dukan_auth_user')));
    if (!hasActiveUser) {
      const currentPath = `/store/${storeIdParam}`;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setAuthVerified(true);
    }
  }, [authLoading, user, profile, storeIdParam, router]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter State
  const [inStoreSearch, setInStoreSearch] = useState('');
  const [selectedProductHighlight, setSelectedProductHighlight] = useState<string>(initialSelectedProduct);
  const [activeCatalogTab, setActiveCatalogTab] = useState('All');

  // Direct Live Chat Modal & Real-time Socket Conversation
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isQuote?: boolean }>>([
    { sender: 'store', text: 'Namaste! How can we assist you with our services/products today?', time: 'Just now' }
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 100% Dynamic Store State (No hardcoded mock directory)
  const [currentStore, setCurrentStore] = useState<StoreBusinessData>({
    id: '',
    name: 'Loading Store...',
    businessType: 'retail',
    category: 'Local Dukaan',
    badgeTitle: 'Verified Dukaan',
    address: 'Fetching live location...',
    city: '',
    pincode: '',
    distanceKm: 0.5,
    walkMinutes: 4,
    rating: 4.8,
    reviewsCount: 1,
    isLiveOpen: true,
    statusBadge: 'Live Open · Available Now',
    badgeBg: 'bg-emerald-600 text-white',
    bannerImg: '',
    phone: '',
    whatsapp: '',
    activeDeal: '',
    workingHours: '08:30 AM - 10:00 PM',
    aboutText: '',
    catalog: []
  });

  // -------------------------------------------------------------
  // STORE OWNER AUTHORIZATION CHECK
  // ONLY the verified store owner (matching client user id) or superadmin
  // can view edit store buttons, add item, delete item, and toggle live status.
  // Normal users/customers ONLY see standard interaction buttons (Chat, Call, WhatsApp, Map, Order).
  // -------------------------------------------------------------
  const isStoreOwner = Boolean(
    // 1. Superadmin has full access to manage stores
    role === 'superadmin' ||
    profile?.role === 'superadmin' ||
    // 2. Direct match on ownerId with logged-in user id or profile id
    (user && currentStore.ownerId && (user.id === currentStore.ownerId || profile?.id === currentStore.ownerId)) ||
    // 3. User's profile registered store_id matches this store's id
    (profile?.store_id && currentStore.id && profile.store_id === currentStore.id) ||
    // 4. Offline/Local draft store ('my-store') when user is logged in as shop_owner
    (currentStore.id === 'my-store' && (role === 'shop_owner' || profile?.role === 'shop_owner'))
  );

  // -------------------------------------------------------------
  // CRUD MODALS STATE: STORE DETAILS
  // -------------------------------------------------------------
  const [showStoreEditModal, setShowStoreEditModal] = useState(false);
  const [storeEditName, setStoreEditName] = useState('');
  const [storeEditCategory, setStoreEditCategory] = useState('');
  const [storeEditBadgeTitle, setStoreEditBadgeTitle] = useState('');
  const [storeEditAddress, setStoreEditAddress] = useState('');
  const [storeEditCity, setStoreEditCity] = useState('');
  const [storeEditPincode, setStoreEditPincode] = useState('');
  const [storeEditWorkingHours, setStoreEditWorkingHours] = useState('');
  const [storeEditPhone, setStoreEditPhone] = useState('');
  const [storeEditWhatsapp, setStoreEditWhatsapp] = useState('');
  const [storeEditBannerImg, setStoreEditBannerImg] = useState('');
  const [storeEditActiveDeal, setStoreEditActiveDeal] = useState('');
  const [storeEditAboutText, setStoreEditAboutText] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // -------------------------------------------------------------
  // CRUD MODALS STATE: PRODUCT / SERVICE
  // -------------------------------------------------------------
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormType, setProdFormType] = useState<'product' | 'service'>('product');
  const [prodFormTag, setProdFormTag] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState<number>(0);
  const [prodFormMrp, setProdFormMrp] = useState<number>(0);
  const [prodFormUnit, setProdFormUnit] = useState('1 Unit');
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormStockStatus, setProdFormStockStatus] = useState('In Stock - Ready at Counter');
  const [prodFormInStock, setProdFormInStock] = useState(true);
  const [prodFormImage, setProdFormImage] = useState('/grocery-product.jpg');
  const [prodFormSpecs, setProdFormSpecs] = useState('');
  const [uploadingProductImg, setUploadingProductImg] = useState(false);

  // -------------------------------------------------------------
  // REVIEW / RATING STATE
  // -------------------------------------------------------------
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myRating, setMyRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // -------------------------------------------------------------
  // LOAD DYNAMIC STORE & PRODUCTS FROM SUPABASE TABLE
  // -------------------------------------------------------------
  const loadStoreFromSupabase = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { store: dbStore, products: dbProducts } = await getStoreWithProducts(storeIdParam);

      if (dbStore) {
        // Map Supabase products to CatalogItem
        const catalogItems: CatalogItem[] = (dbProducts || []).map((p) => {
          const price = Number(p.price) || 0;
          const discountAmt = Number(p.discount_price) || 0;
          const mrp = discountAmt > 0 ? price + discountAmt : price;
          const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return {
            id: p.id,
            name: p.name,
            categoryTag: p.category || dbStore.category,
            price,
            mrp: mrp > price ? mrp : undefined,
            discountPercent: discountPercent > 0 ? discountPercent : undefined,
            unitOrDuration: '1 Unit',
            description: p.description || '',
            inStock: p.is_in_stock ?? true,
            stockStatusText: p.is_in_stock ? 'In Stock - Ready at Counter' : 'Out of Stock',
            itemType: dbStore.business_offering_type === 'service_providing' ? 'service' : 'product',
            image: p.image_url || '/grocery-product.jpg',
            specs: ['Counter Verified', 'Direct Local Delivery']
          };
        });

        const storeData: StoreBusinessData = {
          id: dbStore.id,
          ownerId: dbStore.owner_id,
          name: dbStore.store_name,
          businessType: dbStore.business_offering_type === 'service_providing' ? 'legal_advocate' : 'retail',
          category: dbStore.category,
          badgeTitle: dbStore.category,
          address: `${dbStore.address_line || ''}${dbStore.city ? ', ' + dbStore.city : ''}`,
          city: dbStore.city || '',
          pincode: dbStore.pincode || '',
          distanceKm: 0.8,
          walkMinutes: 6,
          rating: Number(dbStore.rating) || 4.8,
          reviewsCount: dbStore.total_reviews || 0,
          isLiveOpen: dbStore.is_live_open ?? true,
          statusBadge: dbStore.is_live_open ? 'Live Open · Available Now' : 'Store Currently Closed',
          badgeBg: dbStore.is_live_open ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
          bannerImg: dbStore.banner_url || '/hero-dukandar.jpg',
          phone: dbStore.phone_contact || '',
          whatsapp: dbStore.whatsapp_number || dbStore.phone_contact || '',
          activeDeal: 'Verified Local Storefront',
          workingHours: `${dbStore.standard_open_time || '08:30'} - ${dbStore.standard_close_time || '22:00'}`,
          aboutText: dbStore.description || 'Welcome to our verified storefront on Dukan Bari.',
          catalog: catalogItems
        };

        setCurrentStore(storeData);
      } else {
        // Fallback check from localStorage if merchant created offline
        if (typeof window !== 'undefined') {
          const savedStore = localStorage.getItem('dukan_bari_my_store');
          if (savedStore) {
            try {
              const s = JSON.parse(savedStore);
              const prods = localStorage.getItem('dukan_bari_my_products');
              const parsedProds = prods ? JSON.parse(prods) : [];

              setCurrentStore({
                id: 'my-store',
                ownerId: user?.id,
                name: s.storeName || 'Champion Hair Art',
                businessType: s.businessOfferingType === 'service_providing' ? 'legal_advocate' : 'retail',
                category: s.category || 'Services',
                badgeTitle: s.category || 'Local Dukaan',
                address: s.addressLine || 'Surat Main Road',
                city: s.city || 'Surat',
                pincode: s.pincode || '395004',
                distanceKm: 0.5,
                walkMinutes: 4,
                rating: 5.0,
                reviewsCount: 1,
                isLiveOpen: typeof s.isLiveOpen === 'boolean' ? s.isLiveOpen : true,
                statusBadge: s.isLiveOpen ? 'Live Open · Available Now' : 'Store Currently Closed',
                badgeBg: s.isLiveOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
                bannerImg: s.bannerUrl || '',
                phone: s.phoneContact || '9925299431',
                whatsapp: s.whatsappNumber || '9925299431',
                activeDeal: 'Welcome to our Store',
                workingHours: `${s.openTime || '08:30 AM'} - ${s.closeTime || '10:00 PM'}`,
                aboutText: 'Local verified merchant store.',
                catalog: parsedProds.map((p: any) => ({
                  id: p.id || `prod-${Date.now()}`,
                  name: p.name || 'Store Item',
                  categoryTag: p.categoryTag || s.category || 'General',
                  price: Number(p.price) || 0,
                  mrp: Number(p.mrp) || Number(p.price) || 0,
                  discountPercent: p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
                  unitOrDuration: p.unitOrDuration || '1 Unit',
                  description: p.description || '',
                  inStock: p.inStock ?? true,
                  stockStatusText: p.stockStatusText || 'Available at Counter',
                  itemType: p.itemType || 'product',
                  image: p.image || '/grocery-product.jpg',
                  specs: ['Counter Pickup']
                }))
              });
              setLoading(false);
              return;
            } catch (e) {
              console.error(e);
            }
          }
        }
        setErrorMsg('Store record not found. You can set it up now.');
      }
    } catch (err: any) {
      console.error('Error fetching store data:', err);
      setErrorMsg(err.message || 'Error loading store information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreFromSupabase();
  }, [storeIdParam]);

  // Load reviews whenever store is known
  const loadReviews = async (storeId: string) => {
    if (!storeId || storeId === 'my-store') return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?store_id=${encodeURIComponent(storeId)}`, {
        cache: 'no-store'
      });
      const json = await res.json();
      if (json.success) {
        const fetchedReviews = json.reviews || [];
        setReviews(fetchedReviews);
        if (fetchedReviews.length > 0) {
          const avg = parseFloat(
            (fetchedReviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / fetchedReviews.length).toFixed(1)
          );
          setCurrentStore((prev) => ({
            ...prev,
            rating: avg,
            reviewsCount: fetchedReviews.length
          }));
        }
        // Pre-fill my rating if I already reviewed
        if (user?.id) {
          const myReview = fetchedReviews.find((r: any) => r.user_id === user.id);
          if (myReview) {
            setMyRating(myReview.rating);
            setReviewComment(myReview.comment || '');
            setReviewSubmitted(true);
          }
        }
      }
    } catch (err) {
      console.warn('loadReviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore.id && currentStore.id !== '') {
      loadReviews(currentStore.id);
    }
  }, [currentStore.id]);

  // Real-time Socket.IO Message Listener & Audio Notifications for Shopper
  useEffect(() => {
    let activeSocket: any = null;
    async function initLiveSocket() {
      try {
        activeSocket = await getSocket();
        activeSocket.on('receive_message', (msg: any) => {
          // If this message was sent by the current user, ignore (already rendered)
          if (user?.id && msg.sender_id === user.id) return;

          playNotificationChime();
          const isQuote = msg.message_type === 'price_quote';
          const textContent = isQuote
            ? `🏷️ Counter Price Quote: ₹${msg.metadata?.quoted_price || msg.content}`
            : msg.content;

          setChatMessages((prev) => {
            if (msg.id && prev.some((m: any) => m.id === msg.id)) return prev;
            if (prev.some((m: any) => m.text === textContent && m.sender === 'store')) return prev;
            return [
              ...prev,
              {
                id: msg.id,
                sender: 'store',
                text: textContent,
                time: msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isQuote
              }
            ];
          });

          showToast(`💬 New response from ${currentStore.name}: ${textContent}`);
        });
      } catch (err) {
        console.warn('Store socket initialization warning:', err);
      }
    }
    initLiveSocket();

    return () => {
      if (activeSocket) {
        activeSocket.off('receive_message');
      }
    };
  }, [currentStore.name, user?.id]);

  // -------------------------------------------------------------
  // 1-TAP LIVE OPEN / CLOSED TOGGLE (SYNC WITH SUPABASE TABLE)
  // -------------------------------------------------------------
  const handleToggleLiveStatus = async () => {
    if (!isStoreOwner) {
      alert('Permission denied: Only the verified store owner can change store status.');
      return;
    }
    const nextStatus = !currentStore.isLiveOpen;
    const updated: StoreBusinessData = {
      ...currentStore,
      isLiveOpen: nextStatus,
      statusBadge: nextStatus ? 'Live Open · Available Now' : 'Store Currently Closed',
      badgeBg: nextStatus ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
    };
    setCurrentStore(updated);
    showToast(`Store status updated to: ${nextStatus ? '🟢 LIVE OPEN' : '🔴 CLOSED'}`);

    // Sync to Supabase `stores` table
    await syncStoreToSupabase({
      id: currentStore.id,
      is_live_open: nextStatus
    });
  };

  // -------------------------------------------------------------
  // STORE DETAILS CRUD: EDIT & SAVE (SYNC WITH SUPABASE TABLE)
  // -------------------------------------------------------------
  const handleOpenStoreEdit = () => {
    if (!isStoreOwner) return;
    setStoreEditName(currentStore.name);
    setStoreEditCategory(currentStore.category);
    setStoreEditBadgeTitle(currentStore.badgeTitle);
    setStoreEditAddress(currentStore.address);
    setStoreEditCity(currentStore.city || 'Surat');
    setStoreEditPincode(currentStore.pincode || '395004');
    setStoreEditWorkingHours(currentStore.workingHours);
    setStoreEditPhone(currentStore.phone);
    setStoreEditWhatsapp(currentStore.whatsapp);
    setStoreEditBannerImg(currentStore.bannerImg);
    setStoreEditActiveDeal(currentStore.activeDeal || '');
    setStoreEditAboutText(currentStore.aboutText);
    setShowStoreEditModal(true);
  };

  const handleSaveStoreDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStoreOwner) {
      alert('Permission denied: Only the verified store owner can edit store details.');
      return;
    }
    if (!storeEditName.trim()) {
      alert('Store name cannot be empty');
      return;
    }

    const payload: Partial<DbStore> = {
      id: currentStore.id && currentStore.id.length > 20 ? currentStore.id : undefined,
      store_name: storeEditName.trim(),
      category: storeEditCategory.trim() || 'Grocery & Kirana',
      address_line: storeEditAddress.trim() || 'Surat Main Road',
      city: storeEditCity.trim() || 'Surat',
      pincode: storeEditPincode.trim() || '395004',
      phone_contact: storeEditPhone.trim(),
      whatsapp_number: storeEditWhatsapp.trim() || storeEditPhone.trim(),
      banner_url: storeEditBannerImg || undefined,
      description: storeEditAboutText.trim() || undefined,
      is_live_open: currentStore.isLiveOpen
    };

    const savedDbStore = await syncStoreToSupabase(payload);

    if (savedDbStore) {
      setCurrentStore((prev) => ({
        ...prev,
        id: savedDbStore.id,
        name: savedDbStore.store_name,
        category: savedDbStore.category,
        badgeTitle: savedDbStore.category,
        address: `${savedDbStore.address_line}, ${savedDbStore.city}`,
        city: savedDbStore.city,
        pincode: savedDbStore.pincode,
        phone: savedDbStore.phone_contact || '',
        whatsapp: savedDbStore.whatsapp_number || '',
        bannerImg: savedDbStore.banner_url || '',
        aboutText: savedDbStore.description || ''
      }));
      setShowStoreEditModal(false);
      showToast('✓ Store profile updated successfully!');
    } else {
      alert('Failed to update store details. Please check your connection.');
    }
  };

  // Upload Banner directly to Supabase Storage Bucket
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetStoreId = currentStore.id || storeIdParam;
    setUploadingBanner(true);
    const res = await uploadImageToSupabase(file, 'banners', {
      existingUrl: storeEditBannerImg || currentStore.bannerImg,
      customName: targetStoreId ? `store_banner_${targetStoreId}` : undefined,
    });
    setUploadingBanner(false);

    if (res.success && res.url) {
      setStoreEditBannerImg(res.url);
      setCurrentStore((prev) => ({ ...prev, bannerImg: res.url! }));
      showToast('✓ Store banner updated successfully!');
      if (targetStoreId) {
        syncStoreToSupabase({
          id: targetStoreId,
          owner_id: user?.id,
          banner_url: res.url,
        }).catch((e) => console.warn('Banner auto-sync note:', e));
        supabase.from('stores').update({ banner_url: res.url }).eq('id', targetStoreId).then();
      }
    } else {
      alert(`Upload note: ${res.error || 'Failed to upload image'}`);
    }
  };

  // -------------------------------------------------------------
  // PRODUCT / SERVICE CRUD: ADD, EDIT, DELETE (SYNC WITH SUPABASE TABLE)
  // -------------------------------------------------------------
  const handleOpenAddProduct = () => {
    if (!isStoreOwner) return;
    setEditingProductId(null);
    setProdFormName('');
    setProdFormType('product');
    setProdFormTag(currentStore.category || 'General');
    setProdFormPrice(150);
    setProdFormMrp(180);
    setProdFormUnit('1 Unit');
    setProdFormDesc('');
    setProdFormStockStatus('In Stock - Ready at Counter');
    setProdFormInStock(true);
    setProdFormImage('/grocery-product.jpg');
    setProdFormSpecs('Counter Verified, Instant Delivery');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (item: CatalogItem) => {
    if (!isStoreOwner) return;
    setEditingProductId(item.id);
    setProdFormName(item.name);
    setProdFormType(item.itemType || 'product');
    setProdFormTag(item.categoryTag);
    setProdFormPrice(item.price);
    setProdFormMrp(item.mrp || item.price);
    setProdFormUnit(item.unitOrDuration);
    setProdFormDesc(item.description);
    setProdFormStockStatus(item.stockStatusText || (item.inStock ? 'In Stock - Ready at Counter' : 'Out of Stock'));
    setProdFormInStock(item.inStock);
    setProdFormImage(item.image);
    setProdFormSpecs(item.specs ? item.specs.join(', ') : '');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStoreOwner) {
      alert('Permission denied: Only the verified store owner can add or edit products.');
      return;
    }
    if (!prodFormName.trim()) {
      alert('Product / Service name is required');
      return;
    }

    const price = Number(prodFormPrice) || 0;
    const mrp = Number(prodFormMrp) || price;
    const discountAmt = mrp > price ? mrp - price : 0;
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const specsArray = prodFormSpecs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProductId) {
      // UPDATE in Supabase
      const updated = await updateProductInSupabase({
        id: editingProductId,
        name: prodFormName.trim(),
        price,
        discount_price: discountAmt,
        category: prodFormTag.trim() || currentStore.category,
        description: prodFormDesc.trim(),
        image_url: prodFormImage,
        is_in_stock: prodFormInStock
      });

      if (updated) {
        setCurrentStore((prev) => ({
          ...prev,
          catalog: prev.catalog.map((item) =>
            item.id === editingProductId
              ? {
                ...item,
                name: updated.name,
                price: Number(updated.price),
                mrp: mrp > price ? mrp : undefined,
                discountPercent: discountPercent > 0 ? discountPercent : undefined,
                categoryTag: updated.category || prev.category,
                description: updated.description || '',
                image: updated.image_url || '/grocery-product.jpg',
                inStock: updated.is_in_stock ?? true,
                stockStatusText: updated.is_in_stock ? 'In Stock - Ready at Counter' : 'Out of Stock',
                specs: specsArray
              }
              : item
          )
        }));
        showToast('✓ Item updated in catalog successfully!');
        setShowProductModal(false);
      } else {
        alert('Failed to update item in catalog.');
      }
    } else {
      // CREATE in Supabase
      const inserted = await addProductToSupabase({
        store_id: currentStore.id,
        name: prodFormName.trim(),
        price,
        discount_price: discountAmt,
        category: prodFormTag.trim() || currentStore.category,
        description: prodFormDesc.trim(),
        image_url: prodFormImage,
        is_in_stock: prodFormInStock
      });

      if (inserted) {
        const newItem: CatalogItem = {
          id: inserted.id,
          name: inserted.name,
          categoryTag: inserted.category || currentStore.category,
          price: Number(inserted.price),
          mrp: mrp > price ? mrp : undefined,
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
          unitOrDuration: prodFormUnit.trim() || '1 Unit',
          description: inserted.description || '',
          inStock: inserted.is_in_stock ?? true,
          stockStatusText: inserted.is_in_stock ? 'In Stock - Ready at Counter' : 'Out of Stock',
          itemType: prodFormType,
          image: inserted.image_url || '/grocery-product.jpg',
          specs: specsArray.length > 0 ? specsArray : ['Verified Stock']
        };

        setCurrentStore((prev) => ({
          ...prev,
          catalog: [newItem, ...prev.catalog]
        }));
        showToast('✓ New item added to catalog successfully!');
        setShowProductModal(false);
      } else {
        alert('Failed to add item to catalog.');
      }
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!isStoreOwner) {
      alert('Permission denied: Only the verified store owner can delete products.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }

    const ok = await deleteProductFromSupabase(id);
    if (ok) {
      setCurrentStore((prev) => ({
        ...prev,
        catalog: prev.catalog.filter((c) => c.id !== id)
      }));
      if (selectedProductHighlight === name || selectedProductHighlight === id) {
        setSelectedProductHighlight('');
      }
      showToast(`✓ "${name}" removed from catalog.`);
    } else {
      alert('Failed to delete item from catalog.');
    }
  };

  // Upload Product Image to Supabase Storage Bucket
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
      showToast('✓ Photo updated successfully!');
    } else {
      alert(`Upload note: ${res.error || 'Failed to upload image'}`);
    }
  };

  // Spotlight Item identification
  const spotlightItem =
    currentStore.catalog.find(
      (item) =>
        item.name.toLowerCase().includes(selectedProductHighlight.toLowerCase()) ||
        item.id === selectedProductHighlight
    ) || currentStore.catalog[0];

  // In-store filtered catalog
  const filteredCatalog = currentStore.catalog.filter((item) => {
    const matchesTab = activeCatalogTab === 'All' || item.categoryTag === activeCatalogTab;
    const matchesSearch =
      item.name.toLowerCase().includes(inStoreSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(inStoreSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const catalogCategories = [
    'All',
    ...Array.from(new Set(currentStore.catalog.map((c) => c.categoryTag).filter(Boolean)))
  ];

  // Handle Opening Live Chat modal & connecting room
  const handleOpenLiveChat = async (prefilledText?: string) => {
    if (!user) {
      const currentPath = `/store/${storeIdParam || currentStore.id}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (prefilledText) {
      setChatInput(prefilledText);
    }
    setShowChatModal(true);

    if (currentStore.id) {
      try {
        const conv = await createOrGetConversation(currentStore.id, user.id, prefilledText);
        if (conv) {
          setActiveConversationId(conv.id);
          await joinConversation(conv.id);
          const msgs = await getConversationMessages(conv.id);
          if (msgs && msgs.length > 0) {
            setChatMessages(
              msgs.map((m) => {
                const isQuote = m.message_type === 'price_quote';
                const text = isQuote
                  ? `🏷️ Counter Price Quote: ₹${m.metadata?.quoted_price || m.content}`
                  : m.content;
                return {
                  sender: m.sender_id === conv.customer_id ? 'user' : 'store',
                  text,
                  time: m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Recently',
                  isQuote
                };
              })
            );
          }
        }
      } catch (err) {
        console.warn('Could not sync chat conversation:', err);
      }
    }
  };

  const handleOpenChatForItem = (itemName: string, itemPrice: number) => {
    if (!user) {
      const currentPath = `/store/${storeIdParam || currentStore.id}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    handleOpenLiveChat(`Namaste, is "${itemName}" (₹${itemPrice}) available at counter right now?`);
  };

  // Handle Live Chat Send (Saves to Supabase & Emits to Merchant via Socket)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      const currentPath = `/store/${storeIdParam || currentStore.id}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: timeNow }
    ]);

    try {
      let convId = activeConversationId;
      if (!convId && currentStore.id) {
        const conv = await createOrGetConversation(currentStore.id, user.id, userMsg);
        if (conv) {
          convId = conv.id;
          setActiveConversationId(conv.id);
          await joinConversation(conv.id);
        }
      }

      if (convId) {
        const savedMsg = await sendDirectMessage({
          conversation_id: convId,
          sender_id: user.id,
          content: userMsg,
          message_type: 'text'
        });

        await sendChatMessage({
          conversationId: convId,
          content: userMsg,
          messageType: 'text',
          senderId: user.id,
          messageId: savedMsg?.id
        });
      }
    } catch (err) {
      console.error('Error sending customer chat message:', err);
    }
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) {
      router.push(`/login?redirect=/store/${storeIdParam}`);
      return;
    }
    if (!myRating || myRating < 1) {
      showToast('Please select a star rating first!');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: currentStore.id,
          user_id: user.id,
          user_name: profile?.full_name || user?.user_metadata?.full_name || 'Customer',
          rating: myRating,
          comment: reviewComment.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setReviewSubmitted(true);
        showToast(`⭐ Thank you! Your ${myRating}-star review was saved.`);
        // Refresh reviews and update displayed rating
        await loadReviews(currentStore.id);
        // Recalc the displayed rating
        const allR = [...reviews.filter((r: any) => r.user_id !== user.id), json.review];
        const avg = parseFloat((allR.reduce((s: number, r: any) => s + Number(r.rating), 0) / allR.length).toFixed(1));
        setCurrentStore((prev) => ({ ...prev, rating: avg, reviewsCount: allR.length }));
      } else {
        showToast(json.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (authLoading || !authVerified) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-300 gap-3">
        <div className="w-8 h-8 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="w-10 h-10 text-[#2874f0] animate-spin" />
        <h2 className="text-lg font-black text-slate-800">
          Loading Store & Catalog...
        </h2>
        <p className="text-xs text-slate-500">Connecting to verified merchant catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-black px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Flipkart Blue Bar */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-white/10 rounded-sm text-white flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-blue-300/40 hidden sm:block" />
            <span className="text-sm font-black italic tracking-tight hidden sm:inline">
              Dukan Bari · {currentStore.name}
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* 2. STORE BANNER TOP CARD (Dynamic from Supabase `stores` table) */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="relative min-h-[300px] sm:min-h-[320px] w-full overflow-hidden bg-slate-900">
            {/* Store Banner Image (Always visible with high quality fallback) */}
            <Image
              src={currentStore.bannerImg || '/hero-dukandar.jpg'}
              alt={currentStore.name}
              fill
              priority
              unoptimized={(currentStore.bannerImg || '/hero-dukandar.jpg').startsWith('http')}
              className="object-cover object-center"
            />

            {/* Quick 1-Tap Change Banner Button (Visible ONLY to Store Owner) */}
            {isStoreOwner && (
              <label
                className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/30 cursor-pointer flex items-center gap-1.5 transition-colors shadow-md"
                title="Upload / Change Store Banner"
              >
                <Upload className="w-3.5 h-3.5 text-[#ffe500]" />
                <span>{uploadingBanner ? 'Uploading...' : 'Change Banner'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </label>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

            {/* Top Right Distance & Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
              <span className="bg-white/95 backdrop-blur text-slate-900 font-black text-xs px-3 py-1.5 rounded-sm shadow-md">
                📍 {currentStore.distanceKm} km door ({currentStore.walkMinutes} mins walk)
              </span>

              {isStoreOwner ? (
                <button
                  onClick={handleToggleLiveStatus}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black shadow cursor-pointer transition-transform hover:scale-105 ${currentStore.badgeBg}`}
                  title="Click to toggle store open/close status in Supabase"
                >
                  <span className="w-2 h-2 rounded-full bg-white live-indicator" />
                  <span>{currentStore.statusBadge}</span>
                </button>
              ) : (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black shadow ${currentStore.badgeBg}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full bg-white ${currentStore.isLiveOpen ? 'live-indicator animate-pulse' : ''
                      }`}
                  />
                  <span>{currentStore.statusBadge}</span>
                </div>
              )}
            </div>

            {/* Banner Bottom Information */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
              <div className="max-w-2xl">
                <span className="bg-[#ffe500] text-[#2874f0] font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1 shadow-xs">
                  {currentStore.category}
                </span>

                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    {currentStore.name}
                  </h1>
                  <div className="flex items-center gap-0.5 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded shadow">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-3 h-3 ${s <= Math.round(currentStore.rating) ? 'fill-[#ffe500] text-[#ffe500]' : 'fill-white/30 text-white/30'}`} fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                    <span className="ml-1">{currentStore.rating}</span>
                    {currentStore.reviewsCount > 0 && (
                      <span className="text-white/70 font-normal ml-0.5">({currentStore.reviewsCount})</span>
                    )}
                  </div>
                  {isStoreOwner && (
                    <button
                      onClick={handleOpenStoreEdit}
                      className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2 py-0.5 rounded border border-white/30 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Info</span>
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-1.5 drop-shadow-xs">
                  <MapPin className="w-4 h-4 text-[#ffe500] flex-shrink-0" />
                  <span>{currentStore.address}</span>
                </p>

                <p className="text-xs text-blue-200 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  <span>Working Hours: {currentStore.workingHours}</span>
                </p>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=28.5355,77.2090&destination=${encodeURIComponent(
                    currentStore.name + ', ' + currentStore.address
                  )}&travelmode=walking`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  title="Open Google Maps Walking Navigation"
                >
                  <Navigation2 className="w-4 h-4 animate-pulse" />
                  <span>Google Maps</span>
                </a>

                <button
                  onClick={() => handleOpenLiveChat()}
                  className="px-3 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1759c9] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>

                {currentStore.phone && (
                  <a
                    href={`tel:${currentStore.phone}`}
                    className="px-3 py-2 rounded-sm bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#2874f0]" />
                    <span>Call Store</span>
                  </a>
                )}

                {currentStore.whatsapp && (
                  <a
                    href={`https://wa.me/${currentStore.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste, I am contacting ${currentStore.name} via Dukan Bari!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-sm bg-[#25D366] hover:bg-[#1eb855] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Flash deal strip if present */}
          {currentStore.activeDeal && (
            <div className="bg-[#fff7ed] border-t border-orange-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-bold text-[#ea580c]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#ea580c]" />
                <span>Special Promotion: {currentStore.activeDeal}</span>
              </div>
              <span className="text-[10px] bg-[#ea580c] text-white px-2 py-0.5 rounded">
                Verified Deal
              </span>
            </div>
          )}
        </div>

        {/* 3. SPOTLIGHT ITEM (If products exist) */}
        {spotlightItem && (
          <div className="bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 rounded-2xl border-2 border-amber-300 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Spotlight Item (Selected & Pinned on Top)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{spotlightItem.stockStatusText || (spotlightItem.inStock ? '✓ In Stock - Available at Store Counter' : 'Out of Stock')}</span>
                </span>
                {isStoreOwner && (
                  <button
                    onClick={() => handleOpenEditProduct(spotlightItem)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1"
                    title="Edit this item in Supabase"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit in Supabase</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                {/* Product Image */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white border border-amber-200 overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src={spotlightItem.image}
                    alt={spotlightItem.name}
                    fill
                    unoptimized={spotlightItem.image.startsWith('http')}
                    className="object-cover"
                  />
                  {spotlightItem.discountPercent ? (
                    <span className="absolute top-2 left-2 bg-[#fb641b] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {spotlightItem.discountPercent}% OFF
                    </span>
                  ) : null}
                </div>

                {/* Product Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#2874f0] px-2 py-0.5 rounded">
                      {spotlightItem.categoryTag}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {spotlightItem.itemType}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {spotlightItem.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {spotlightItem.description}
                  </p>

                  {/* Price display with MRP comparison */}
                  <div className="flex items-baseline gap-2.5 pt-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ₹{spotlightItem.price}
                    </span>
                    {spotlightItem.mrp && spotlightItem.mrp > spotlightItem.price && (
                      <span className="text-sm text-slate-400 line-through">
                        MRP ₹{spotlightItem.mrp}
                      </span>
                    )}
                    {spotlightItem.discountPercent && spotlightItem.discountPercent > 0 ? (
                      <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Save ₹{(spotlightItem.mrp || spotlightItem.price) - spotlightItem.price} ({spotlightItem.discountPercent}% OFF)
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold text-slate-500">
                      per {spotlightItem.unitOrDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-row md:flex-col gap-2.5 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => handleOpenChatForItem(spotlightItem.name, spotlightItem.price)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire Availability (Order Karein)</span>
                </button>
                {currentStore.whatsapp && (
                  <a
                    href={`https://wa.me/${currentStore.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste, is ${spotlightItem.name} (₹${spotlightItem.price}) available at counter right now?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1eb855] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. IN-STORE SEARCH BAR, DYNAMIC CATEGORY TABS & PRODUCT LIST (FROM SUPABASE) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black text-slate-900">
                  Store Catalogue & Services
                </h2>
                <span className="bg-blue-100 text-[#2874f0] text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredCatalog.length} items from Supabase
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Directly connected to Supabase `products` table with live counter rates and availability.
              </p>
            </div>

            {/* In-Store Search Bar & + Add Item button */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={inStoreSearch}
                  onChange={(e) => setInStoreSearch(e.target.value)}
                  placeholder="Search products, services, rates..."
                  className="w-full bg-[#f8fafc] text-slate-900 text-xs pl-9 pr-4 py-2 rounded border border-slate-300 focus:outline-none focus:border-[#2874f0]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {isStoreOwner && (
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-black rounded flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Category Tabs */}
          {catalogCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
              {catalogCategories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCatalogTab(tab)}
                  className={`px-4 py-2 rounded-t font-bold text-xs whitespace-nowrap transition-colors border-b-2 ${activeCatalogTab === tab
                    ? 'border-[#2874f0] text-[#2874f0] bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Catalog Items Grid (100% Dynamic from Supabase) */}
          {filteredCatalog.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No items in store catalogue yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isStoreOwner
                  ? 'Add your services, items, rates, and stock status to display them dynamically to customers.'
                  : "This store hasn't listed any items or services yet. You can chat or call the store directly."}
              </p>
              {isStoreOwner ? (
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-bold rounded shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add First Item to Supabase</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenLiveChat()}
                  className="px-4 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-bold rounded shadow-xs inline-flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Store on Live Chat</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProductHighlight(item.name)}
                  className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:border-[#2874f0] bg-white group ${selectedProductHighlight === item.name
                    ? 'border-amber-400 ring-2 ring-amber-300/50'
                    : 'border-slate-200'
                    }`}
                >
                  <div>
                    {/* 1. PRODUCT IMAGE WITH OVERLAYS & CRUD BUTTONS */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized={item.image.startsWith('http')}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                      {/* Discount badge */}
                      {item.discountPercent && item.discountPercent > 0 ? (
                        <span className="absolute top-2.5 left-2.5 bg-[#fb641b] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                          {item.discountPercent}% OFF
                        </span>
                      ) : null}

                      {/* Category Tag */}
                      <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow">
                        {item.categoryTag}
                      </span>

                      {/* Floating CRUD Actions on Item Card - ONLY visible to verified store owner */}
                      {isStoreOwner && (
                        <div className="absolute top-2.5 right-24 sm:right-28 flex items-center gap-1 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditProduct(item);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded shadow-md transition-colors"
                            title="Edit in Supabase"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#2874f0]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(item.id, item.name);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-rose-50 text-rose-600 rounded shadow-md transition-colors"
                            title="Delete from Supabase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Quick highlight banner if spotlighted */}
                      {selectedProductHighlight === item.name && (
                        <span className="absolute bottom-2 left-2 bg-[#ffe500] text-[#1e3a8a] text-[10px] font-black px-2 py-0.5 rounded shadow">
                          ⭐ Selected Item
                        </span>
                      )}
                    </div>

                    {/* 2. PRODUCT DETAILS & IN-STOCK STATUS */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${item.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${item.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                              }`}
                          />
                          <span>
                            {item.stockStatusText || (item.inStock ? 'In Stock - Ready at Counter' : 'Out of Stock')}
                          </span>
                        </span>

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.itemType}
                        </span>
                      </div>

                      <h4 className="font-black text-base text-slate-900 leading-snug hover:text-[#2874f0] transition-colors">
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 3. PRICE SECTION & ORDER BUTTON */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="flex items-end justify-between pt-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-slate-900">
                            ₹{item.price}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-none font-bold">
                          {item.unitOrDuration}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChatForItem(item.name, item.price);
                          }}
                          className="px-3.5 py-2 bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{item.itemType === 'service' ? 'Consult' : 'Order'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. About Business & Verified Credentials */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">About {currentStore.name}</h3>
            {isStoreOwner && (
              <button
                onClick={handleOpenStoreEdit}
                className="text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit About Info</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
            {currentStore.aboutText}
          </p>

        </div>

        {/* 6. CUSTOMER REVIEWS & RATINGS */}
        {currentStore.id && currentStore.id !== 'my-store' && (
          <div className="bg-white rounded-xl shadow-xs hidden border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Avg ⭐ {currentStore.rating}
                </p>
              </div>
              {/* Average rating display */}
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900">{currentStore.rating}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-4 h-4 ${s <= Math.round(currentStore.rating) ? 'fill-[#fb8c00] text-[#fb8c00]' : 'fill-slate-200 text-slate-200'}`} fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5">{currentStore.reviewsCount} ratings</span>
              </div>
            </div>

            {/* Leave a review (non-owners only) */}
            {!isStoreOwner && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-800">
                  {reviewSubmitted ? '✅ Your Review' : '⭐ Rate this Store'}
                </p>
                {/* Star selector */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => !reviewSubmitted && setHoverRating(star)}
                      onMouseLeave={() => !reviewSubmitted && setHoverRating(0)}
                      onClick={() => !reviewSubmitted && setMyRating(star)}
                      className={`transition-transform ${!reviewSubmitted ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-7 h-7 transition-colors ${star <= (hoverRating || myRating) ? 'fill-[#fb8c00] text-[#fb8c00]' : 'fill-slate-200 text-slate-200'
                        }`} fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    </button>
                  ))}
                  {myRating > 0 && (
                    <span className="text-xs font-black text-slate-700 ml-1">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                    </span>
                  )}
                </div>

                {/* Comment */}
                <textarea
                  rows={2}
                  placeholder="Optional: Share your experience (e.g. great service, fresh items...)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={reviewSubmitted}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#2874f0] resize-none disabled:bg-slate-50 disabled:text-slate-500"
                />

                {!reviewSubmitted ? (
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting || myRating === 0}
                    className="bg-[#2874f0] hover:bg-[#1759c9] disabled:opacity-50 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    {reviewSubmitting ? (
                      <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" /></svg> Submitting...</>
                    ) : (
                      <>⭐ Submit Review</>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">✓ Review Submitted</span>
                    <button
                      onClick={() => { setReviewSubmitted(false); }}
                      className="text-xs text-[#2874f0] font-bold hover:underline"
                    >Edit</button>
                  </div>
                )}
              </div>
            )}

            {/* Reviews list */}
            {reviewsLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" /></svg>
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-xs font-bold">No reviews yet. Be the first to rate this store!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {reviews.map((r: any) => (
                  <div key={r.id || r.user_id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/60">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-[10px] font-black">
                          {(r.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-slate-800">{r.user_name || 'Customer'}</span>
                        {r.user_id === user?.id && (
                          <span className="text-[10px] bg-blue-50 text-[#2874f0] font-bold px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-3 h-3 ${s <= r.rating ? 'fill-[#fb8c00] text-[#fb8c00]' : 'fill-slate-200 text-slate-200'}`} fill="currentColor">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                          </svg>
                        ))}
                        <span className="text-[10px] font-bold text-slate-600 ml-0.5">{r.rating}/5</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed ml-9">{r.comment}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 ml-9">
                      {r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          MODAL 1: EDIT STORE DETAILS (SYNC WITH SUPABASE `stores` TABLE)
         ------------------------------------------------------------- */}
      {showStoreEditModal && isStoreOwner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#2874f0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#ffe500]" />
                <h3 className="text-base font-black">Edit Store (Syncs with Supabase)</h3>
              </div>
              <button
                onClick={() => setShowStoreEditModal(false)}
                className="text-white hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreDetails} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeEditName}
                  onChange={(e) => setStoreEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="e.g. Champion Hair Art"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeEditCategory}
                    onChange={(e) => setStoreEditCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="e.g. Hair Saloon & Grooming"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={storeEditBadgeTitle}
                    onChange={(e) => setStoreEditBadgeTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="e.g. Hair Saloon"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Address Line *
                </label>
                <input
                  type="text"
                  required
                  value={storeEditAddress}
                  onChange={(e) => setStoreEditAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="e.g. Surat Main Road"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeEditCity}
                    onChange={(e) => setStoreEditCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="Surat"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeEditPincode}
                    onChange={(e) => setStoreEditPincode(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="395004"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Phone Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeEditPhone}
                    onChange={(e) => setStoreEditPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="9925299431"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={storeEditWhatsapp}
                    onChange={(e) => setStoreEditWhatsapp(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="9925299431"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={storeEditWorkingHours}
                  onChange={(e) => setStoreEditWorkingHours(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="08:30 AM - 10:00 PM"
                />
              </div>

              {/* Banner Image with Supabase Storage Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  Store Banner Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={storeEditBannerImg}
                    onChange={(e) => setStoreEditBannerImg(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none"
                    placeholder="Image URL or upload below"
                  />
                  <label className="px-3 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingBanner ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500">
                  Upload directly to Supabase `{SUPABASE_STORE_BUCKET}/banners` bucket.
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  About Business Description
                </label>
                <textarea
                  rows={3}
                  value={storeEditAboutText}
                  onChange={(e) => setStoreEditAboutText(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="Tell customers about your services, experience, specialties..."
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStoreEditModal(false)}
                  className="px-4 py-2 border text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: ADD / EDIT PRODUCT OR SERVICE (SYNC WITH SUPABASE `products` TABLE)
         ------------------------------------------------------------- */}
      {showProductModal && isStoreOwner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#2874f0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffe500]" />
                <h3 className="text-base font-black">
                  {editingProductId ? 'Edit Item in Supabase' : 'Add Item to Supabase'}
                </h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-white hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Item Title / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="e.g. Hair Cut & Beard Styling, Facial Treatment"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Offering Type *
                  </label>
                  <select
                    value={prodFormType}
                    onChange={(e) => setProdFormType(e.target.value as 'product' | 'service')}
                    className="w-full text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none"
                  >
                    <option value="service">Service / Consultation</option>
                    <option value="product">Physical Item / Goods</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Category / Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormTag}
                    onChange={(e) => setProdFormTag(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="e.g. Hair Care, Facial, Shave"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodFormMrp}
                    onChange={(e) => setProdFormMrp(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    Unit / Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormUnit}
                    onChange={(e) => setProdFormUnit(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                    placeholder="1 Session, 1 Unit"
                  />
                </div>
              </div>

              {/* In-Stock Status Controls */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700">Counter Availability:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={prodFormInStock}
                      onChange={(e) => setProdFormInStock(e.target.checked)}
                      className="w-4 h-4 text-[#2874f0] rounded"
                    />
                    <span>{prodFormInStock ? 'Available at Counter' : 'Unavailable'}</span>
                  </label>
                </div>
              </div>

              {/* Product Image with Supabase Storage Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  Item Image Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodFormImage}
                    onChange={(e) => setProdFormImage(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border rounded-lg bg-white focus:outline-none"
                    placeholder="/grocery-product.jpg or https://..."
                  />
                  <label className="px-3 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingProductImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingProductImg}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500">
                  Upload directly to Supabase `{SUPABASE_STORE_BUCKET}/products` bucket.
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:border-[#2874f0] focus:outline-none"
                  placeholder="Details about this service or item..."
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2874f0] hover:bg-[#1c5fcc] text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingProductId ? 'Update Item' : 'Add to Catalog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 3: DIRECT 1-TO-1 LIVE CHAT MODAL
         ------------------------------------------------------------- */}
      {showChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          {!user ? (
            <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2874f0] mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-base mb-1">Login Required</h4>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Please log in or create an account to start direct live messaging with <strong>{currentStore.name}</strong>.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/store/${storeIdParam || currentStore.id}`)}`}
                  className="flex-1 py-2.5 bg-[#2874f0] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow transition-all text-center flex items-center justify-center"
                >
                  Log In / Sign Up
                </Link>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 bg-[#2874f0] text-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black">{currentStore.name}</h4>
                  <span className="text-[10px] text-emerald-200 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Direct Socket Live Active · {currentStore.distanceKm} km door</span>
                  </span>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-white hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-xs ${msg.sender === 'user'
                        ? 'bg-[#2874f0] text-white'
                        : msg.isQuote
                          ? 'bg-amber-50 text-slate-900 border-2 border-amber-300 shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                        }`}
                    >
                      {msg.isQuote ? (
                        <div className="font-extrabold text-amber-900">
                          {msg.text}
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                      <span
                        className={`text-[9px] block text-right mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                          }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask price quote, consultation or pickup..."
                  className="flex-1 px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#2874f0]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#fb641b] hover:bg-[#e65100] text-white font-bold text-xs"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
