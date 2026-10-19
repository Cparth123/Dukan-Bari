'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  Save,
  Check,
  RefreshCw
} from 'lucide-react';
import { uploadImageToSupabase, SUPABASE_STORE_BUCKET } from '@/lib/storage';

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

interface MockEnquiry {
  id: string;
  customerName: string;
  itemTitle: string;
  description: string;
  distanceKm: number;
  timeAgo: string;
  hasReplied: boolean;
  quotedPrice?: number;
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
  const { profile, signOut } = useAuth();
  const router = useRouter();

  // Active Tab: 'profile' | 'products' | 'offers' | 'enquiries'
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'offers' | 'enquiries'>('profile');

  // 1-Tap Live Store Toggle (OPEN / CLOSED)
  const [isLiveOpen, setIsLiveOpen] = useState(true);

  // Store Profile State (100% Dynamic - starts clean or loads from Supabase/storage)
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Grocery & Kirana');
  const [customCategory, setCustomCategory] = useState('');
  const [businessOfferingType, setBusinessOfferingType] = useState<'product_selling' | 'service_providing' | 'both'>('product_selling');
  const [bannerUrl, setBannerUrl] = useState('');
  const [shopPhotoUrl, setShopPhotoUrl] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.2090);
  const [phoneContact, setPhoneContact] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [openTime, setOpenTime] = useState('08:30 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [profileSaved, setProfileSaved] = useState(false);

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

  // Reverse Enquiry Radar Desk
  const [enquiries, setEnquiries] = useState<MockEnquiry[]>([
    {
      id: 'enq-1',
      customerName: 'Priya Verma',
      itemTitle: 'Fortune Sunlite Sunflower Oil 5L Can',
      description: 'Need urgent counter pickup in 15 mins. Is fresh batch available?',
      distanceKm: 0.8,
      timeAgo: '4 mins ago',
      hasReplied: false,
    },
    {
      id: 'enq-2',
      customerName: 'Anand Mishra',
      itemTitle: 'Aashirvaad Shudh Chakki Atta 10kg',
      description: 'Looking for 10kg pack. What is your discounted price?',
      distanceKm: 1.4,
      timeAgo: '12 mins ago',
      hasReplied: true,
      quotedPrice: 420,
    },
    {
      id: 'enq-3',
      customerName: 'Sneha Rao',
      itemTitle: 'Amul Taaza Milk 1L (4 Packets)',
      description: 'Are evening delivery packets available right now?',
      distanceKm: 2.1,
      timeAgo: '25 mins ago',
      hasReplied: false,
    },
  ]);
  const [replyQuote, setReplyQuote] = useState<{ [key: string]: string }>({});

  // Load saved store from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStore = localStorage.getItem('dukan_bari_my_store');
      if (savedStore) {
        try {
          const s = JSON.parse(savedStore);
          if (s.storeName) setStoreName(s.storeName);
          if (s.category) setCategory(s.category);
          if (s.businessOfferingType) setBusinessOfferingType(s.businessOfferingType);
          if (s.bannerUrl) setBannerUrl(s.bannerUrl);
          if (s.shopPhotoUrl) setShopPhotoUrl(s.shopPhotoUrl);
          if (s.addressLine) setAddressLine(s.addressLine);
          if (s.city) setCity(s.city);
          if (s.state) setState(s.state);
          if (s.pincode) setPincode(s.pincode);
          if (s.latitude) setLatitude(s.latitude);
          if (s.longitude) setLongitude(s.longitude);
          if (s.phoneContact) setPhoneContact(s.phoneContact);
          if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
          if (typeof s.isLiveOpen === 'boolean') setIsLiveOpen(s.isLiveOpen);
        } catch (e) {
          console.error('Error loading store from localStorage:', e);
        }
      }

      const savedProducts = localStorage.getItem('dukan_bari_my_products');
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error('Error loading products from localStorage:', e);
        }
      }

      const savedOffers = localStorage.getItem('dukan_bari_my_offers');
      if (savedOffers) {
        try {
          setOffers(JSON.parse(savedOffers));
        } catch (e) {
          console.error('Error loading offers from localStorage:', e);
        }
      }
    }
  }, []);

  // Sync to localStorage
  const saveStoreProfile = () => {
    const storeObj = {
      storeName,
      category: category === 'Other / Custom' && customCategory.trim() ? customCategory : category,
      businessOfferingType,
      bannerUrl,
      shopPhotoUrl,
      addressLine,
      city,
      state,
      pincode,
      latitude,
      longitude,
      phoneContact,
      whatsappNumber,
      openTime,
      closeTime,
      isLiveOpen,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('dukan_bari_my_store', JSON.stringify(storeObj));
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // 1-Click Detect GPS Location
  const handleDetectGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
          setLastUploadedBucketMsg(`📍 Live GPS detected: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
          setTimeout(() => setLastUploadedBucketMsg(''), 4000);
        },
        (err) => {
          alert(`GPS detection note: ${err.message}. Kept current coordinates.`);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  // Image upload handler for Banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const res = await uploadImageToSupabase(file, 'banners');
    setUploadingBanner(false);

    if (res.success && res.url) {
      setBannerUrl(res.url);
      setLastUploadedBucketMsg(`✓ Banner uploaded to Supabase '${SUPABASE_STORE_BUCKET}' bucket!`);
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Image upload handler for Shop Front
  const handleShopPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingShopPhoto(true);
    const res = await uploadImageToSupabase(file, 'stores');
    setUploadingShopPhoto(false);

    if (res.success && res.url) {
      setShopPhotoUrl(res.url);
      setLastUploadedBucketMsg(`✓ Shop photo uploaded to Supabase '${SUPABASE_STORE_BUCKET}' bucket!`);
      setTimeout(() => setLastUploadedBucketMsg(''), 5000);
    } else {
      alert(`Upload notice: ${res.error || 'Failed to upload'}`);
    }
  };

  // Image upload handler for Product modal
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProductImg(true);
    const res = await uploadImageToSupabase(file, 'products');
    setUploadingProductImg(false);

    if (res.success && res.url) {
      setProdFormImage(res.url);
      setLastUploadedBucketMsg(`✓ Product image stored in Supabase '${SUPABASE_STORE_BUCKET}' bucket!`);
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
    const res = await uploadImageToSupabase(file, 'offers');
    setUploadingOfferImg(false);

    if (res.success && res.url) {
      setOfferFormImage(res.url);
      setLastUploadedBucketMsg(`✓ Deal banner stored in Supabase '${SUPABASE_STORE_BUCKET}' bucket!`);
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

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    let updatedProducts: ProductItem[];
    if (editingProductId) {
      updatedProducts = products.map((p) =>
        p.id === editingProductId
          ? {
              ...p,
              name: prodFormName,
              itemType: prodFormType,
              categoryTag: prodFormTag || category,
              price: Number(prodFormPrice),
              mrp: Number(prodFormMrp) || Number(prodFormPrice),
              unitOrDuration: prodFormUnit || '1 Unit',
              description: prodFormDesc,
              stockStatusText: prodFormStockStatus,
              inStock: prodFormInStock,
              image: prodFormImage,
            }
          : p
      );
    } else {
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        name: prodFormName,
        itemType: prodFormType,
        categoryTag: prodFormTag || category,
        price: Number(prodFormPrice),
        mrp: Number(prodFormMrp) || Number(prodFormPrice),
        unitOrDuration: prodFormUnit || '1 Unit',
        description: prodFormDesc,
        stockStatusText: prodFormStockStatus,
        inStock: prodFormInStock,
        image: prodFormImage,
      };
      updatedProducts = [newProd, ...products];
    }

    setProducts(updatedProducts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dukan_bari_my_products', JSON.stringify(updatedProducts));
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product/service?')) {
      const filtered = products.filter((p) => p.id !== id);
      setProducts(filtered);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dukan_bari_my_products', JSON.stringify(filtered));
      }
    }
  };

  // Offer CRUD
  const handleOpenAddOffer = () => {
    setEditingOfferId(null);
    setOfferFormTitle('');
    setOfferFormDiscountTag('FLAT 20% OFF');
    setOfferFormValidUntil('8:00 PM Tonight');
    setOfferFormRadiusKm(3.0);
    setOfferFormImage('/dhaba-thali.jpg');
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

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFormTitle.trim()) return;

    let updatedOffers: OfferItem[];
    if (editingOfferId) {
      updatedOffers = offers.map((o) =>
        o.id === editingOfferId
          ? {
              ...o,
              title: offerFormTitle,
              discountTag: offerFormDiscountTag,
              validUntil: offerFormValidUntil,
              radiusKm: Number(offerFormRadiusKm),
              bannerImage: offerFormImage,
              isActive: offerFormIsActive,
            }
          : o
      );
    } else {
      const newOffer: OfferItem = {
        id: `offer-${Date.now()}`,
        title: offerFormTitle,
        discountTag: offerFormDiscountTag,
        validUntil: offerFormValidUntil,
        radiusKm: Number(offerFormRadiusKm),
        bannerImage: offerFormImage,
        isActive: offerFormIsActive,
      };
      updatedOffers = [newOffer, ...offers];
    }

    setOffers(updatedOffers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dukan_bari_my_offers', JSON.stringify(updatedOffers));
    }
    setShowOfferModal(false);
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      const filtered = offers.filter((o) => o.id !== id);
      setOffers(filtered);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dukan_bari_my_offers', JSON.stringify(filtered));
      }
    }
  };

  const handleReplyEnquiry = (enquiryId: string) => {
    const price = parseFloat(replyQuote[enquiryId] || '0');
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === enquiryId
          ? { ...e, hasReplied: true, quotedPrice: price > 0 ? price : 250 }
          : e
      )
    );
  };

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

            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/20">
              Supabase Storage: <code className="text-[#ffe500] font-mono">Store</code> Bucket
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* View Live Storefront Button */}
            <Link
              href="/store/store-1"
              target="_blank"
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors border border-white/20"
              title="Open public customer view of this store"
            >
              <Eye className="w-3.5 h-3.5 text-[#ffe500]" />
              <span className="hidden sm:inline">View Live Storefront</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>

            {/* Live Open / Closed 1-Tap Toggle */}
            <button
              onClick={() => {
                const nextStatus = !isLiveOpen;
                setIsLiveOpen(nextStatus);
                if (typeof window !== 'undefined') {
                  const saved = localStorage.getItem('dukan_bari_my_store');
                  const current = saved ? JSON.parse(saved) : {};
                  localStorage.setItem('dukan_bari_my_store', JSON.stringify({ ...current, isLiveOpen: nextStatus }));
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm ${
                isLiveOpen
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300'
                  : 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isLiveOpen ? '🟢 LIVE OPEN' : '🔴 CLOSED'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                signOut();
                router.push('/');
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

      {/* Main Content Studio Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-1 mb-6 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>1. Store Profile & Location</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'products'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>2. Products & Services ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'offers'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>3. Deals & Offers ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'enquiries'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>4. Customer Enquiries Radar ({enquiries.length})</span>
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

                <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Bucket: Supabase Storage / {SUPABASE_STORE_BUCKET}</span>
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
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          businessOfferingType === 'product_selling'
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
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          businessOfferingType === 'service_providing'
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
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          businessOfferingType === 'both'
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

                  {/* Opening and Closing Hours */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Standard Working Hours
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        placeholder="Open: 08:30 AM"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                      <input
                        type="text"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        placeholder="Close: 10:00 PM"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Pincode & City */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      City & Pincode *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode (e.g. 110017)"
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#2874f0] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & GPS Section */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#2874f0]" />
                        <span>Store Physical Address & GPS Radar Coordinates</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Exact coordinates pin your store on the Google Maps Radar so nearby customers discover you.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="bg-blue-50 hover:bg-blue-100 text-[#2874f0] border border-blue-200 px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>Detect My Current GPS Location</span>
                    </button>
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
                      <label className="block text-[11px] font-black text-slate-600 mb-1">
                        Latitude (Lat)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 mb-1">
                        Longitude (Lng)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
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
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                                item.inStock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              offer.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
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
                        className={`text-xs font-bold px-2.5 py-1 rounded transition-colors ${
                          offer.isActive ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
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
        {/* TAB 4: REVERSE CUSTOMER ENQUIRIES RADAR DESK */}
        {/* ========================================================= */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
              <div className="border-b border-slate-100 pb-5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2874f0] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Customer Reverse Enquiry Radar</h2>
                    <p className="text-xs text-slate-500">
                      Nearby shoppers broadcasted product requirements within 1-3km. Reply instantly with stock availability & counter price.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="border border-slate-200 rounded-xl p-4 bg-[#f8fafc] hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="text-sm font-black text-slate-900">{enq.itemTitle}</h4>
                        <span className="text-[10px] bg-blue-50 text-[#2874f0] font-bold px-2 py-0.5 rounded border border-blue-100">
                          {enq.distanceKm} km away
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">{enq.timeAgo}</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{enq.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                      <div className="text-xs font-bold text-slate-700">
                        Customer: <span className="text-slate-900">{enq.customerName}</span>
                      </div>

                      {enq.hasReplied ? (
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Quote Sent: ₹{enq.quotedPrice} (Customer Notified)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Price Quote (₹)"
                            value={replyQuote[enq.id] || ''}
                            onChange={(e) => setReplyQuote({ ...replyQuote, [enq.id]: e.target.value })}
                            className="w-32 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2874f0]"
                          />
                          <button
                            onClick={() => handleReplyEnquiry(enq.id)}
                            className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-3.5 py-1.5 rounded shadow-xs flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Confirm Stock & Quote</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-colors ${
                      prodFormType === 'product'
                        ? 'bg-blue-50 border-[#2874f0] text-[#2874f0]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    📦 Physical Product (Atta, Oil, Paan, etc.)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdFormType('service')}
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-colors ${
                      prodFormType === 'service'
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
