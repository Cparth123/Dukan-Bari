'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Store,
  User,
  ShoppingBag,
  Briefcase,
  UtensilsCrossed,
  Lock,
  Mail,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Percent,
  ArrowRight
} from 'lucide-react';

export type BusinessOfferingType = 'product_selling' | 'service_providing' | 'both';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [role, setRole] = useState<UserRole>('customer');
  const [offeringType, setOfferingType] = useState<BusinessOfferingType>('product_selling');

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dukandar / Service Provider specific fields
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Grocery & Kirana');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill from query params if coming from Home Page quick register
  useEffect(() => {
    const qPhone = searchParams.get('phone');
    const qRole = searchParams.get('role');
    const qType = searchParams.get('type') as BusinessOfferingType | null;

    if (qPhone) setPhoneNumber(qPhone);
    if (qRole === 'shop_owner' || qRole === 'customer') setRole(qRole);
    if (qType && ['product_selling', 'service_providing', 'both'].includes(qType)) {
      setOfferingType(qType);
    }
  }, [searchParams]);

  // Dynamic categories based on offering type
  const productCategories = [
    'Pan Masala & Paan Parlour',
    'Panipuri & Live Chaat Lari',
    'Grocery & Kirana Store',
    'Vegetable & Fruit Thela',
    'Dairy & Fresh Milk Parlour',
    'Bakery, Farsan & Sweet Mart',
    'Pharmacy & Medical Store',
    'Mobile & Electronics',
    'Clothing & Garments',
    'Hardware & Electricals',
    'Cycle, Tyre & Puncture Repair',
    'Flower Garland & Puja Samagri'
  ];

  const serviceCategories = [
    'Hair Saloon & Grooming',
    'Beauty Parlour & Mehndi Artist',
    'Mochi & Footwear Repair',
    'Tailor & Stitching Alterations',
    'Dhobi & Ironing Laundry',
    'Advocate & Legal Advisory',
    'CA & Tax Advisor (GST/ITR)',
    'Doctor & Clinic Consultation',
    'Electrician & Wireman',
    'Plumber & Sanitary Repair',
    'AC & Appliance Repair',
    'Mobile & Computer Repair'
  ];

  const bothCategories = [
    'Panipuri & Chaat Lari',
    'Chai Kitli & Nasta Point',
    'Dhaba & Punjabi Restaurant',
    'Fast Food & Chinese Corner',
    'Family Dining & Kathiyawadi',
    'Cafe & Bakery Delights',
    'Catering & Party Events'
  ];

  const currentCategories =
    offeringType === 'product_selling'
      ? productCategories
      : offeringType === 'service_providing'
      ? serviceCategories
      : bothCategories;

  // Sync category when offeringType changes
  const handleOfferingTypeChange = (type: BusinessOfferingType) => {
    setOfferingType(type);
    if (type === 'product_selling') setCategory(productCategories[0]);
    else if (type === 'service_providing') setCategory(serviceCategories[0]);
    else setCategory(bothCategories[0]);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const finalCategory = isCustomCategory ? (customCategory.trim() || 'General Store') : category;

    const storeDetails =
      role === 'shop_owner'
        ? {
            storeName,
            category: finalCategory,
            offeringType,
            address,
            city,
            pincode
          }
        : undefined;

    const { error } = await signUpWithEmail(
      email,
      password,
      role,
      fullName,
      phoneNumber,
      storeDetails
    );

    if (error) {
      setErrorMsg(error.message || 'Signup failed. Please try again.');
      setLoading(false);
      return;
    }

    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }

    if (role === 'shop_owner') {
      router.push('/merchant');
    } else {
      router.push('/explore');
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      {/* 1. Flipkart-style Top Bar */}
      <header className="bg-[#2874f0] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white text-[#2874f0] flex items-center justify-center font-black shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xl font-black italic tracking-tight text-white">Dukan Bari</span>
                <span className="text-[10px] font-black italic text-[#ffe500] px-1 bg-[#1a5bc7] rounded">
                  Plus
                </span>
              </div>
              <span className="text-[10px] text-blue-100 italic tracking-wider flex items-center gap-0.5">
                <span>Explore</span>
                <span className="text-[#ffe500] font-bold">Hyperlocal 1-5 km</span>
                <span className="text-[#ffe500] text-[8px]">✦</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold">
            <Link href="/explore" className="text-white hover:text-[#ffe500] transition-colors hidden sm:inline-block">
              Explore Nearby
            </Link>
            <span className="text-blue-300 hidden sm:inline">|</span>
            <span className="text-blue-100">Existing Member?</span>
            <Link
              href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              className="bg-white text-[#2874f0] hover:bg-slate-100 px-4 py-1.5 rounded-sm font-extrabold shadow-sm transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Two-Column Flipkart Split Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT COLUMN: Flipkart Seller Hub Hero Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1a5bc7] via-[#2874f0] to-[#0d47a1] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#ffe500]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#ffe500] text-[#1a5bc7] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Hyperlocal Commerce & Services</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                  Sell Products or Provide Services Locally
                </h1>
                <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                  Join 10,000+ local dukandars, medical stores, lawyers, tax advisors, and service pros reaching neighbours in 1 to 5 km.
                </p>
              </div>

              {/* Flipkart Style Feature Bullets */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-[#ffe500] text-[#1a5bc7] flex items-center justify-center font-bold flex-shrink-0">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">0% Commission Fee</h4>
                    <p className="text-xs text-blue-100">Keep 100% of your earnings. Direct UPI & cash settlement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-emerald-400 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Products & Services Together</h4>
                    <p className="text-xs text-blue-100">Whether Kirana goods or Legal / CA advisory, list your business easily.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-amber-400 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">Live Radar & Spotlight</h4>
                    <p className="text-xs text-blue-100">Shoppers discover your open status, pinned products, and live price counter.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vocal for Local & Digital India Feature Card */}
            <div className="mt-6 relative z-10 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-white/10 to-emerald-500/20 border border-white/25 backdrop-blur-sm shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🇮🇳</span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#ffe500]">
                    Vocal for Local & Digital India
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full">
                  #DigitalBharat
                </span>
              </div>

              <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 border border-white/20 shadow-inner">
                <Image
                  src="/vocal-for-local.jpg"
                  alt="Vocal for Local and Digital India"
                  fill
                  className="object-cover"
                />
              </div>

              <p className="text-[11px] text-white font-bold leading-snug">
                "Local Khareedo, Desh Badhao — Har Rupiya Apne Mohalle Me!"
              </p>
              <p className="text-[10px] text-blue-100 mt-1 leading-relaxed">
                <strong className="text-[#ffe500]">Meaning:</strong> Buying from your neighborhood kirana, saloon, chai stall, or panipuri lari keeps wealth within your local community, powered by 0% commission & Digital UPI!
              </p>
            </div>

            {/* Dukandar Verified Chip */}
            <div className="mt-4 relative z-10 pt-3 border-t border-white/20 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#ffe500] shadow flex-shrink-0">
                <Image
                  src="/hero-dukandar.jpg"
                  alt="Dukan Bari Merchant"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-[11px]">
                <div className="text-[#ffe500] font-black">★★★★★ 10,000+ Local Dukandars</div>
                <p className="text-blue-100 text-[10px] leading-tight">Empowering street vendors and retail stores across India</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Flipkart Style Registration Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            <div className="border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
                  <p className="text-xs text-slate-500 mt-1">Get started in less than 2 minutes</p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-[#2874f0] px-3 py-1.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure & Verified</span>
                </div>
              </div>
            </div>

            {redirectUrl && (
              <div className="mb-4 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-[#1a5bc7] text-xs flex items-center gap-2.5 font-semibold">
                <Lock className="w-4 h-4 flex-shrink-0 text-[#2874f0]" />
                <span>Authentication required. Please sign up or log in to message with local stores.</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. ROLE SELECTOR */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    role === 'customer'
                      ? 'bg-white text-[#2874f0] shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-[#2874f0]" />
                  <span>Customer / Khareedar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('shop_owner')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    role === 'shop_owner'
                      ? 'bg-[#2874f0] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#ffe500]" />
                  <span>Dukandar / Vyapari</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* DUKANDAR SPECIAL SECTION: OFFERING TYPE (Products vs Services vs Both) */}
              {role === 'shop_owner' && (
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-[#1a5bc7]">
                        2. Select Business Offering Type <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold bg-[#ffe500] text-blue-900 px-2 py-0.5 rounded-full">
                        New Feature
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-3">
                      Do you sell physical retail products or offer professional local services?
                    </p>

                    {/* 3 Interactive Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Option 1: Product Selling */}
                      <button
                        type="button"
                        onClick={() => handleOfferingTypeChange('product_selling')}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          offeringType === 'product_selling'
                            ? 'bg-white border-[#2874f0] shadow-md ring-2 ring-[#2874f0]/20'
                            : 'bg-white/70 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            offeringType === 'product_selling' ? 'bg-[#2874f0] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900">Product Selling</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Kirana, Chemist, Electronics, Garments, Hardware
                        </p>
                        {offeringType === 'product_selling' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2874f0]" />
                        )}
                      </button>

                      {/* Option 2: Service Providing */}
                      <button
                        type="button"
                        onClick={() => handleOfferingTypeChange('service_providing')}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          offeringType === 'service_providing'
                            ? 'bg-white border-[#2874f0] shadow-md ring-2 ring-[#2874f0]/20'
                            : 'bg-white/70 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            offeringType === 'service_providing' ? 'bg-[#2874f0] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900">Service Providing</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Advocate, CA/Tax, Clinic, Repair, Salon, Boutique
                        </p>
                        {offeringType === 'service_providing' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2874f0]" />
                        )}
                      </button>

                      {/* Option 3: Both / Food & Service */}
                      <button
                        type="button"
                        onClick={() => handleOfferingTypeChange('both')}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          offeringType === 'both'
                            ? 'bg-white border-[#2874f0] shadow-md ring-2 ring-[#2874f0]/20'
                            : 'bg-white/70 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                            offeringType === 'both' ? 'bg-[#2874f0] text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <UtensilsCrossed className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-900">Both / Food</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Dhabas, Restaurants, Cafes & Catering
                        </p>
                        {offeringType === 'both' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2874f0]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Business Name & Dynamic Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {offeringType === 'service_providing' ? 'Office / Firm / Clinic Name' : 'Shop / Store Name'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder={
                          offeringType === 'service_providing'
                            ? 'e.g. Sharma Legal & CA Advisory'
                            : offeringType === 'both'
                            ? 'e.g. Punjab Dhaba & Family Restaurant'
                            : 'e.g. Gupta General Store'
                        }
                        className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Category ({offeringType === 'service_providing' ? 'Services' : offeringType === 'both' ? 'Food & Hospitality' : 'Retail Goods'})
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomCategory(!isCustomCategory)}
                          className="text-[10px] font-extrabold text-[#2874f0] hover:underline"
                        >
                          {isCustomCategory ? '← Choose from list' : '+ Add Custom Category'}
                        </button>
                      </div>

                      {isCustomCategory ? (
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Type your category (e.g. Matka Kulfi, Chaviwala, etc.)"
                            className="w-full bg-blue-50/60 text-slate-900 text-xs px-3.5 py-2.5 rounded-lg border-2 border-[#2874f0] focus:outline-none focus:ring-1 focus:ring-[#2874f0]"
                          />
                          <span className="absolute right-2.5 top-2.5 text-[9px] font-bold bg-[#ffe500] text-blue-900 px-1.5 py-0.5 rounded">
                            Custom
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomCategory(true);
                              } else {
                                setCategory(e.target.value);
                              }
                            }}
                            className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] appearance-none"
                          >
                            {currentCategories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="__custom__">✨ + Add Custom Category (Custom Vyapar)...</option>
                          </select>
                          <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address, City, Pincode */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Physical Address Line <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Shop 14, Main Market, Sector 5"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="New Delhi"
                          className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="110001"
                          className="w-full px-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* USER BASIC PROFILE INFO */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {role === 'shop_owner' ? '3. Owner / Partner Contact Details' : '2. Your Contact Information'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com (optional)"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PRIMARY SUBMIT CTA - FLIPKART ORANGE */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fb641b] hover:bg-[#e65a17] text-white font-extrabold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {role === 'shop_owner'
                        ? offeringType === 'service_providing'
                          ? 'Register as Service Provider'
                          : offeringType === 'both'
                          ? 'Register Food / Hospitality Business'
                          : 'Register as Dukandar (0% Fee)'
                        : 'Register as Khareedar (Shopper)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR DIVIDER */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
              </div>
            </div>

            {/* GOOGLE SIGN IN */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* FOOTER LINK */}
            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="font-black text-[#2874f0] hover:underline"
              >
                Sign in to Dukan Bari
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2874f0]" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
