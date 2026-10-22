'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import InteractiveGoogleRadarMap from '@/components/InteractiveGoogleRadarMap';
import {
  INDIAN_STATES,
  INDIAN_STATES_DATA,
  detectStateByCity
} from '@/lib/indiaGeoData';
import {
  Store,
  Search,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  Phone,
  Sliders,
  Send,
  X,
  CheckCircle,
  LogOut,
  Tag,
  ChevronRight,
  Filter,
  Navigation,
  Compass,
  Layers,
  Map as MapIcon,
  ShoppingBag,
  ExternalLink,
  LocateFixed,
  Navigation2,
  Heart,
  Flag,
  ShieldCheck,
  CheckCheck,
  Play,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Lock
} from 'lucide-react';

interface ShowcaseProduct {
  name: string;
  price: number;
  mrp?: number;
  weight?: string;
  image?: string;
  stockStatus?: string;
}

interface RealStore {
  id: string;
  name: string;
  category: string;
  businessOfferingType?: string;
  description?: string;
  address: string;
  city: string;
  pincode?: string;
  state: string;
  distanceKm: number;
  walkMinutes: number;
  isLiveOpen: boolean;
  openTime?: string;
  closeTime?: string;
  statusBadge: string;
  badgeBg: string;
  phone: string;
  whatsapp: string;
  activeDeal?: string;
  rating: number;
  reviewsCount?: number;
  bannerImg: string;
  logoImg?: string;
  productImg?: string;
  showcaseProducts: ShowcaseProduct[];
  mapAngle: number;
  lat: number;
  lng: number;
}

function ExploreContent() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authVerified, setAuthVerified] = useState(false);

  // Guard: Without login don't show shop details and list page
  useEffect(() => {
    if (authLoading) return;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('dukan_auth_token') || localStorage.getItem('dukan_admin_token')) : null;
    const hasActiveUser = Boolean(token && (user || profile || localStorage.getItem('dukan_auth_user')));
    if (!hasActiveUser) {
      router.replace('/login?redirect=/explore');
    } else {
      setAuthVerified(true);
    }
  }, [authLoading, user, profile, router]);

  // Mode: List View or Live Map Radar View
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Location: City & State Wise Filters from indiaGeoData
  const [selectedState, setSelectedState] = useState<string>('Gujarat');
  const [selectedCity, setSelectedCity] = useState<string>('Surat');
  const [radiusKm, setRadiusKm] = useState<number>(5.0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real Database Stores state (100% Dynamic from Supabase via /api/stores)
  const [stores, setStores] = useState<RealStore[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);

  // Selected store for detail / map focus
  const [highlightedStoreId, setHighlightedStoreId] = useState<string | null>(null);


  // Active Chat Modal with a store
  const [activeChatStore, setActiveChatStore] = useState<RealStore | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'store', text: 'Namaste! Welcome to our counter. How can we help you today?', time: 'Just now' }
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');

  // Live GPS Location & Destination Tracking State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 21.1702,
    lng: 72.8311
  });
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [trackingStore, setTrackingStore] = useState<RealStore | null>(null);
  const [trackingDistanceKm, setTrackingDistanceKm] = useState<number>(0.6);
  const [isSimulatingTracking, setIsSimulatingTracking] = useState<boolean>(false);

  // Available Categories
  const categories = [
    'All',
    'Advocate & Legal Services',
    'Hair Saloon & Grooming',
    'Grocery & Kirana',
    'CA & Tax Advisors',
    'Food, Dhabas & Restaurants',
    'Pharmacy & Medical',
    'Panipuri & Chaat Lari',
    'Pan Masala & Paan Parlour',
    'Mochi & Shoe Repair',
    'Chai Kitli & Nasta Point',
    'Cycle & Puncture Repair',
    'Bakery & Dairy',
    'Electronics & Mobile'
  ];

  // 1. Read URL param `category` dynamically on mount & whenever searchParams change
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams]);

  // 2. Fetch real stores and products from Supabase API (/api/stores)
  useEffect(() => {
    let isMounted = true;
    async function loadRealStores() {
      setIsLoadingStores(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') {
          params.set('category', selectedCategory);
        }
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }
        if (userLocation.lat && userLocation.lng) {
          params.set('lat', userLocation.lat.toString());
          params.set('lng', userLocation.lng.toString());
        }

        const res = await fetch(`/api/stores?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.stores)) {
            setStores(json.stores);
          } else {
            setStores([]);
          }
        }
      } catch (err) {
        console.error('Failed to load stores from /api/stores:', err);
        if (isMounted) setStores([]);
      } finally {
        if (isMounted) setIsLoadingStores(false);
      }
    }

    loadRealStores();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, userLocation.lat, userLocation.lng]);

  // Handle Category Pill Click & update URL param
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'All') {
      router.push('/explore');
    } else {
      router.push(`/explore?category=${encodeURIComponent(categoryName)}`);
    }
  };

  // State selection handler
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const cities = INDIAN_STATES_DATA[newState] || [];
    if (cities.length > 0) {
      setSelectedCity(cities[0].name);
      setUserLocation({
        lat: cities[0].latitude,
        lng: cities[0].longitude
      });
    }
  };

  // City selection handler
  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    const cities = INDIAN_STATES_DATA[selectedState] || [];
    const matched = cities.find((c) => c.name.toLowerCase() === newCity.toLowerCase());
    if (matched) {
      setUserLocation({
        lat: matched.latitude,
        lng: matched.longitude
      });
    }
  };

  // Filter stores by radius
  const filteredStores = stores.filter((store) => {
    return store.distanceKm <= radiusKm;
  });

  // Nearest store finder
  const nearestOpenStore =
    [...filteredStores].filter((s) => s.isLiveOpen).sort((a, b) => a.distanceKm - b.distanceKm)[0] ||
    filteredStores[0];

  const handleStartChatWithStore = (store: RealStore) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/explore')}`);
      return;
    }
    setActiveChatStore(store);
  };


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/explore')}`);
      return;
    }
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: inputMsg, time: 'Just now' }
    ]);
    setInputMsg('');
  };

  // Live GPS Location Detection
  const handleDetectLiveLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(6));
          const lng = parseFloat(position.coords.longitude.toFixed(6));
          setUserLocation({ lat, lng });
          setGpsActive(true);
        },
        (error) => {
          console.warn('Geolocation fallback:', error.message);
          setUserLocation({ lat: 21.1702, lng: 72.8311 });
          setGpsActive(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const startTrackingStore = (store: RealStore) => {
    setTrackingStore(store);
    setTrackingDistanceKm(store.distanceKm);
    setIsSimulatingTracking(false);
  };

  const handleSimulateWalk = () => {
    if (!trackingStore) return;
    setIsSimulatingTracking(true);
    const interval = setInterval(() => {
      setTrackingDistanceKm((prev) => {
        if (prev <= 0.05) {
          clearInterval(interval);
          setIsSimulatingTracking(false);
          return 0;
        }
        return Math.max(0, parseFloat((prev - 0.1).toFixed(2)));
      });
    }, 700);
  };

  const getGoogleMapsNavUrl = (store: RealStore) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination =
      store.lat && store.lng
        ? `${store.lat},${store.lng}`
        : encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  };

  if (authLoading || !authVerified) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-300 gap-3">
        <div className="w-8 h-8 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16">
      {/* 1. Header Bar */}
      <header className="bg-[#2874f0] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#2874f0] font-black text-lg shadow-xs">
                🏪
              </div>
              <div>
                <span className="font-black text-lg tracking-tight block leading-none">
                  Dukan <span className="text-[#ffe500]">Bari</span>
                </span>
                <span className="text-[10px] text-blue-100 font-bold block">
                  Near You (1-5km)
                </span>
              </div>
            </Link>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-xl mx-2 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops, services, items (e.g. Atta, Oil, Lawyer, Haircut)..."
                className="w-full bg-white text-slate-900 text-xs font-semibold pl-3.5 pr-9 py-2 rounded-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[#ffe500]"
              />
              <button
                type="button"
                className="absolute right-0 top-0 bottom-0 px-3 bg-[#ffe500] hover:bg-[#ebd300] text-slate-900 rounded-r-sm flex items-center justify-center transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-blue-700/60 p-0.5 rounded border border-blue-400/40">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs transition-colors flex items-center gap-1 ${viewMode === 'list'
                  ? 'bg-[#ffe500] text-[#2874f0] font-black shadow-xs'
                  : 'text-white hover:text-blue-100'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs transition-colors flex items-center gap-1 ${viewMode === 'map'
                  ? 'bg-[#ffe500] text-[#2874f0] font-black shadow-xs'
                  : 'text-white hover:text-blue-100'
                  }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Live Map Radar</span>
              </button>
            </div>

            <button
              onClick={() => {
                signOut();
                router.push('/login');
              }}
              className="text-white hover:text-blue-100 text-xs font-bold px-2 py-1 cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* 2. Top Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Distance Geofence Slider */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Sliders className="w-4 h-4 text-[#2874f0]" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Distance Geofence:</span>
            <div className="flex items-center gap-2 flex-1 sm:w-56">
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-[#2874f0]"
              />
              <span className="text-xs font-black text-[#2874f0] min-w-[50px]">{radiusKm} km</span>
            </div>
          </div>

          {/* Location State & City Dropdowns */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-[#f1f3f6] border border-slate-300 rounded px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2874f0] flex-shrink-0" />
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">State:</span>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#f1f3f6] border border-slate-300 rounded px-2.5 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {(INDIAN_STATES_DATA[selectedState] || []).map((ct) => (
                  <option key={ct.name} value={ct.name}>{ct.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDetectLiveLocation}
              title="Detect Live GPS Location"
              className="p-2 bg-blue-50 hover:bg-blue-100 text-[#2874f0] rounded border border-blue-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live GPS</span>
            </button>
          </div>

          {/* Category Filter Pills (Syncs with URL param) */}
          <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryClick(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === c
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'bg-[#f1f3f6] text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Location & Nearest Shop Notification Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-extrabold text-slate-800">
              📍 Current Location: <span className="text-[#2874f0]">{selectedCity}, {selectedState}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              GPS: {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
            </span>
          </div>

          {nearestOpenStore && (
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <span>Nearest Open Dukandar:</span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-black shadow-xs">
                {nearestOpenStore.name} ({nearestOpenStore.distanceKm} km · ~{nearestOpenStore.walkMinutes} min walk)
              </span>
            </div>
          )}
        </div>

        {/* 4. Live Map Radar View */}
        {viewMode === 'map' && (
          <InteractiveGoogleRadarMap
            userLocation={userLocation}
            radiusKm={radiusKm}
            stores={filteredStores as any}
            selectedStore={(filteredStores.find((s) => s.id === highlightedStoreId) as any) || null}
            onSelectStore={(store) => {
              const id = store ? store.id : null;
              setHighlightedStoreId(id);
              if (id) {
                const cardElement = document.getElementById(`store-card-${id}`);
                if (cardElement) {
                  cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }}
            onTrackStore={(store) => startTrackingStore(store as any)}
            onChatStore={(store) => handleStartChatWithStore(store as any)}
            onSwitchToList={() => setViewMode('list')}
          />
        )}

        {/* 5. STORE CARDS SECTION: Dynamic Supabase Stores with Real Products & States */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                Nearby Physical Stores ({filteredStores.length} shops open within {radiusKm} km)
              </h2>
              {selectedCategory !== 'All' && (
                <span className="bg-blue-100 text-[#2874f0] text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>Filtered: {selectedCategory}</span>
                  <button
                    onClick={() => handleCategoryClick('All')}
                    className="hover:text-red-500 font-bold ml-1"
                    title="Clear category filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Verified Live Stores</span>
            </span>
          </div>

          {/* Loading Skeleton */}
          {isLoadingStores && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="h-44 bg-slate-200 rounded-lg w-full"></div>
                  <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-10 bg-slate-100 rounded"></div>
                    <div className="h-10 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Stores Found State */}
          {!isLoadingStores && filteredStores.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                No Registered Stores Found in &ldquo;{selectedCategory}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                There are currently no registered stores or providers under this category within your {radiusKm} km radius.
                You can expand your distance slider or explore other local categories.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View All Nearby Stores ({stores.length} Available)</span>
                </button>
              </div>
            </div>
          )}

          {/* Store Cards Grid */}
          {!isLoadingStores && filteredStores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  id={`store-card-${store.id}`}
                  className={`bg-white rounded-xl shadow-xs border transition-all overflow-hidden flex flex-col justify-between ${highlightedStoreId === store.id
                    ? 'border-[#2874f0] ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-[#2874f0]'
                    }`}
                >
                  <div>
                    {/* Store Front Banner Image + Distance Badge */}
                    <Link href={`/store/${store.id}`} className="block relative h-44 w-full bg-slate-900 overflow-hidden group">
                      <Image
                        src={store.bannerImg || '/gupta-store.jpg'}
                        alt={store.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                      {/* Distance Badge */}
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-slate-900 font-black text-xs px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#2874f0]" />
                        <span>{store.distanceKm} km door</span>
                      </span>

                      {/* Category & Rating */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white drop-shadow-md group-hover:text-[#ffe500] transition-colors">
                              {store.name}
                            </h3>
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow">
                              <span>{store.rating}</span>
                              <span className="text-[8px]">★</span>
                              {Boolean(store.reviewsCount && store.reviewsCount > 0) && (
                                <span className="text-white/70 font-normal ml-0.5">({store.reviewsCount})</span>
                              )}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#ffe500] drop-shadow-xs block">
                            {store.category}
                          </span>
                          <p className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5 drop-shadow-xs">
                            <MapPin className="w-3 h-3 text-[#ffe500]" />
                            <span>{store.address}, {store.city}</span>
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Products & Services Inset Showcase */}
                    <div className="p-4 bg-[#f8fafc] border-b border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-[#2874f0]" />
                          <span>Available Products & Services ({store.showcaseProducts?.length || 0})</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Counter Ready
                        </span>
                      </div>

                      <div className="space-y-2">
                        {store.showcaseProducts && store.showcaseProducts.length > 0 ? (
                          store.showcaseProducts.slice(0, 3).map((p, idx) => (
                            <Link
                              key={idx}
                              href={`/store/${store.id}?product=${encodeURIComponent(p.name)}`}
                              className="flex items-center justify-between text-xs bg-white hover:bg-blue-50/70 p-2 rounded-lg border border-slate-200/80 transition-all shadow-2xs group/item"
                              title={`Click to view ${p.name}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {p.image && (
                                  <div className="relative w-8 h-8 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                    <Image
                                      src={p.image}
                                      alt={p.name}
                                      fill
                                      className="object-cover group-hover/item:scale-110 transition-transform"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px] group-hover/item:text-[#2874f0]">
                                      {p.name}
                                    </span>
                                    {p.weight && (
                                      <span className="text-[10px] text-slate-400 font-normal">
                                        ({p.weight})
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-700">
                                      {p.stockStatus || 'In Stock'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <div className="flex items-baseline gap-1">
                                    <span className="font-black text-slate-900 group-hover/item:text-[#2874f0] text-xs">
                                      ₹{p.price}
                                    </span>
                                    {p.mrp && p.mrp > p.price && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        ₹{p.mrp}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-[#2874f0] font-black opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  View →
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic py-2 text-center">
                            Full catalog available directly at the counter
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badges & Active Deals */}
                    <div className="p-4 pt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold ${store.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${store.isLiveOpen ? 'bg-white live-indicator' : 'bg-slate-300'}`} />
                          <span>{store.statusBadge}</span>
                        </span>

                        {store.activeDeal && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold bg-[#fff7ed] text-[#ea580c] border border-orange-200">
                            <Tag className="w-3 h-3" />
                            <span>{store.activeDeal}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => startTrackingStore(store)}
                      className="w-full py-2 px-3 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300 shadow-2xs cursor-pointer"
                    >
                      <Navigation2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>🗺️ Live Google Maps Navigation & Tracking ({store.distanceKm} km)</span>
                    </button>

                    <Link
                      href={`/store/${store.id}`}
                      className="w-full py-2 px-3 rounded bg-blue-50 hover:bg-blue-100 text-[#2874f0] font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200 shadow-2xs"
                    >
                      <span>Open Store Banner & Full Catalog</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartChatWithStore(store)}
                        className="flex-1 py-2 px-3 rounded bg-[#2874f0] hover:bg-[#1759c9] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Direct Live Chat (Poochhein)</span>
                      </button>

                      <a
                        href={`https://wa.me/${(store.whatsapp || store.phone).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>


      {/* 1-to-1 Live Chat Modal */}
      {activeChatStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          {!user ? (
            <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2874f0] mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-base mb-1">Login Required</h4>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                Please log in or create an account to start direct live messaging with <strong>{activeChatStore.name}</strong>.
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/login?redirect=${encodeURIComponent('/explore')}`}
                  className="flex-1 py-2.5 bg-[#2874f0] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow transition-all text-center flex items-center justify-center"
                >
                  Log In / Sign Up
                </Link>
                <button
                  onClick={() => setActiveChatStore(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-4 bg-[#2874f0] text-white flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black">{activeChatStore.name}</h4>
                  <span className="text-[10px] text-emerald-200 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Direct Socket Live Active · {activeChatStore.distanceKm} km</span>
                  </span>
                </div>
                <button
                  onClick={() => setActiveChatStore(null)}
                  className="text-white hover:text-slate-200 cursor-pointer"
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
                        : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                        }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask rate, counter pickup, delivery..."
                  className="flex-1 px-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#2874f0]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#fb641b] hover:bg-[#e65100] text-white font-bold text-xs cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Google Maps Live Destination & GPS Tracking Modal */}
      {trackingStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setTrackingStore(null);
                setIsSimulatingTracking(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2874f0] flex items-center justify-center flex-shrink-0">
                <Navigation2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Live GPS Route & Destination Tracker
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Directions to {trackingStore.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2874f0]" />
                  <span>{trackingStore.address}, {trackingStore.city}</span>
                </p>
              </div>
            </div>

            {/* Live Distance & Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining Distance</span>
                <span className="text-xl font-black text-[#2874f0]">
                  {trackingDistanceKm <= 0.05 ? 'Arrived!' : `${(trackingDistanceKm * 1000).toFixed(0)} m`}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  ({trackingDistanceKm.toFixed(2)} km)
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Walking Time</span>
                <span className="text-xl font-black text-emerald-700">
                  {trackingDistanceKm <= 0.05 ? '0 min' : `~${Math.ceil(trackingDistanceKm * 6)} min`}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Brisk Walk</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Live GPS Status</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-black text-emerald-800">High Accuracy</span>
                </div>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                  {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* Animated Walking Progress Bar */}
            <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1 text-[#2874f0]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>You (Current GPS)</span>
                </span>
                <span className="text-slate-400 text-[10px]">
                  {trackingDistanceKm <= 0.05
                    ? '100% Reached'
                    : `${Math.round(((trackingStore.distanceKm - trackingDistanceKm) / trackingStore.distanceKm) * 100) || 10}% En Route`}
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <Store className="w-3.5 h-3.5" />
                  <span>{trackingStore.name}</span>
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#2874f0] via-[#ffe500] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, Math.round(((trackingStore.distanceKm - trackingDistanceKm) / trackingStore.distanceKm) * 100))
                    )}%`
                  }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <button
                  onClick={handleSimulateWalk}
                  disabled={isSimulatingTracking || trackingDistanceKm <= 0.05}
                  className={`px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${trackingDistanceKm <= 0.05
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : isSimulatingTracking
                      ? 'bg-blue-100 text-blue-700 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>
                    {trackingDistanceKm <= 0.05
                      ? 'You Have Arrived! 🎉'
                      : isSimulatingTracking
                        ? 'Tracking Live Walk...'
                        : '🚶 Simulate Walking Step Closer'}
                  </span>
                </button>

                <button
                  onClick={() => setTrackingDistanceKm(trackingStore.distanceKm)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                >
                  Reset Route
                </button>
              </div>
            </div>

            {/* Embedded Google Maps Live Interactive Preview */}
            <div className="mb-5 rounded-xl overflow-hidden border border-slate-300 shadow-inner h-52 relative">
              <iframe
                title="Google Map Live Destination"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${trackingStore.lat},${trackingStore.lng}&z=17&output=embed`}
              />
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-slate-800 shadow">
                📍 Pin: {trackingStore.name} ({trackingStore.category})
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={getGoogleMapsNavUrl(trackingStore)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#2874f0] hover:bg-[#1759c9] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Google Maps Live Navigation App</span>
              </a>

              <button
                onClick={() => {
                  handleStartChatWithStore(trackingStore);
                  setTrackingStore(null);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#2874f0]" />
                <span>Chat with Store</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-[#2874f0]" />
            <span>Loading nearby verified stores...</span>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
