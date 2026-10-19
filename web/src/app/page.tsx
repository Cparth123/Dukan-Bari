'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Store,
  Search,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  Percent,
  Check,
  Heart,
  Flag,
  Navigation2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { setMockRole } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Category Slides for Animated Hero Banner
  const heroSlides = [
    {
      id: 'kirana',
      category: 'Grocery & Kirana Store',
      chip: '🛒 Kirana & Daily Provisions',
      chipBg: 'bg-[#2874f0]',
      image: '/hero-dukandar.jpg',
      badgeText: '0%',
      badgeUnit: 'COMMISSION*',
      badgeSub: 'HAI TOH!',
      badgeColor: 'from-[#ffe500] to-[#ffb700]',
      tagline: 'Zyada mat socho, Dukan Bari pe becho!',
      title: 'Ab Apni Kirana Dukaan Ko Banao Online — Apne Mohalle Ke 1 Se 5 KM Me!',
      desc: 'Connect with thousands of nearby families for atta, dal, oil & daily rations with zero aggregator cut.',
      link: '/explore?category=Grocery+%26+Kirana'
    },
    {
      id: 'panipuri',
      category: 'Panipuri & Chaat Lari',
      chip: '🍲 Golgappa & Chaat Lari',
      chipBg: 'bg-emerald-600',
      image: '/panipuri-stall.jpg',
      badgeText: 'LIVE',
      badgeUnit: 'CART RADAR',
      badgeSub: 'Crossroad GPS!',
      badgeColor: 'from-emerald-400 to-green-500',
      tagline: 'Thele aur Lari se lekar Dukaan tak — Sabhi Online!',
      title: 'Garam Golgappe & Sev Puri Ka Live Counter — Padosi Aayenge Direct!',
      desc: 'Pin your street cart on Google Maps radar. Daily customers find you in 2 mins with direct UPI payments.',
      link: '/explore?category=Panipuri+%26+Chaat+Lari'
    },
    {
      id: 'chai',
      category: 'Chai Kitli & Nasta Point',
      chip: '☕ Kadak Chai & Maskabun Point',
      chipBg: 'bg-amber-600',
      image: '/chai-stall.jpg',
      badgeText: '15m',
      badgeUnit: 'HOT CHAI',
      badgeSub: 'Counter Pickup!',
      badgeColor: 'from-amber-400 to-orange-500',
      tagline: 'Kadak Adrak Chai Aur Samosa — Har Subah Sham Order!',
      title: 'Subah Ki Chai Se Raat Ke Maskabun Tak — Mohalla Khareedega Yahi Se!',
      desc: 'Receive reverse orders for office tea breaks and morning breakfast without giving 30% cuts to food apps.',
      link: '/explore?category=Chai+Kitli+%26+Nasta+Point'
    },
    {
      id: 'advocate',
      category: 'Advocate & Legal Services',
      chip: '⚖️ Advocate & Legal Chamber',
      chipBg: 'bg-purple-700',
      image: '/advocate-office.jpg',
      badgeText: 'HIGH',
      badgeUnit: 'COURT VAKEEL',
      badgeSub: 'Verified Chamber!',
      badgeColor: 'from-purple-400 to-indigo-600',
      tagline: 'Civil, Property & Notary — Chamber Consultation Online',
      title: 'Vakeel Sahab Ka Chamber Bhi Ab Digital — 1-to-1 Live Client Consultation!',
      desc: 'Local residents can book legal consultations, property deed verification, and notary agreements directly.',
      link: '/explore?category=Advocate+%26+Legal+Services'
    },
    {
      id: 'ca',
      category: 'CA & Tax Advisors',
      chip: '📊 CA Office & Tax Advisory',
      chipBg: 'bg-indigo-700',
      image: '/ca-advisor.jpg',
      badgeText: 'ITR',
      badgeUnit: 'GST EXPERT',
      badgeSub: 'Fastrack E-File!',
      badgeColor: 'from-blue-400 to-indigo-500',
      tagline: 'Vyapariyon Ke Accounts Aur GST Ka Pakka Saathi',
      title: 'Income Tax Return Aur GST Filing — Padosi CA Se Direct Contact!',
      desc: 'Help neighborhood businesses with company incorporation, audits, and tax savings with 0% platform fee.',
      link: '/explore?category=CA+%26+Tax+Advisors'
    },
    {
      id: 'food',
      category: 'Food, Dhabas & Restaurants',
      chip: '🍛 Dhaba & Family Restaurant',
      chipBg: 'bg-rose-600',
      image: '/punjab-dhaba.jpg',
      badgeText: '0%',
      badgeUnit: 'COMMISSION',
      badgeSub: 'Keep 100% Margin!',
      badgeColor: 'from-rose-400 to-red-500',
      tagline: 'Food Apps Ko Mat Do 30% — Direct Khareedar Se Judho!',
      title: 'Garma-Garam Dal Makhani Aur Punjabi Thali — Padosi Parivar Khayenge Roz!',
      desc: 'Direct customer orders with 0% commission. Customers pay via UPI and pick up piping hot meals in minutes.',
      link: '/explore?category=Food%2C+Dhabas+%26+Restaurants'
    },
    {
      id: 'pharmacy',
      category: 'Pharmacy & Medical',
      chip: '💊 Chemist & Medical Store',
      chipBg: 'bg-teal-700',
      image: '/apollo-pharmacy.jpg',
      badgeText: '24×7',
      badgeUnit: 'EMERGENCY',
      badgeSub: 'Prescription Chat!',
      badgeColor: 'from-teal-400 to-emerald-500',
      tagline: 'Emergency Dawaiyan 15 Minute Me Ghar Tak',
      title: 'Mohalle Ki Medical Store 24 Ghante Live — Prescription Bhejein Turant!',
      desc: 'Nearby patients broadcast urgent medicine needs. Reply with stock status and serve neighborhood families.',
      link: '/explore?category=Pharmacy+%26+Medical'
    },
    {
      id: 'vocal',
      category: 'Vocal for Local Movement',
      chip: '🇮🇳 Vocal for Local & Digital India',
      chipBg: 'bg-orange-600',
      image: '/vocal-for-local.jpg',
      badgeText: '100%',
      badgeUnit: 'SWADESHI',
      badgeSub: 'Bharat Ka Paisa!',
      badgeColor: 'from-orange-400 to-amber-500',
      tagline: 'Local Khareedo, Desh Badhao — Har Rupiya Apne Mohalle Me!',
      title: 'MNC Aggregators Ko Alvida, Apne Deshi Vyapariyon Ko Digital Shakti!',
      desc: 'Direct UPI into merchant bank accounts with real-time Google Maps live destination and zero corporate fees.',
      link: '/explore'
    }
  ];

  // Auto-play timer for hero banner slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      router.push(`/signup?phone=${encodeURIComponent(phoneNumber)}&role=shop_owner`);
    } else {
      router.push('/signup');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans">
      {/* 1. Flipkart-style Signature Header */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-white text-[#2874f0] flex items-center justify-center font-black shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xl font-black italic tracking-tight text-white">Dukan Bari</span>
                <span className="text-[11px] font-black italic text-[#ffe500] px-1 bg-[#2874f0] rounded">
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for local shops, grocery, medicines, daily essentials nearby..."
              className="w-full bg-white text-slate-800 text-sm px-4 py-2.5 rounded-sm shadow-inner placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 text-[#2874f0] hover:text-[#1759c9] flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Top Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            <Link
              href="/explore"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#ffe500] transition-colors py-1 px-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ffe500]" />
              <span>Explore Nearby (1-5km)</span>
            </Link>

            <Link
              href="/merchant"
              className="bg-[#ffe500] text-[#2874f0] hover:bg-[#f5b500] font-extrabold text-xs px-3.5 py-2 rounded-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Manage My Store</span>
            </Link>

            <Link
              href="/login"
              className="bg-white text-[#2874f0] hover:bg-slate-100 font-extrabold text-xs px-4 py-2 rounded-sm shadow-sm transition-all"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="p-2.5 bg-[#2874f0] border-t border-blue-400/30 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops or items nearby..."
              className="w-full bg-white text-slate-800 text-xs px-3.5 py-2 rounded-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-[#2874f0]">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </header>

      {/* 2. Top Categories Strip (Flipkart-style circular items) */}
      <section className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {[
            { label: 'Panipuri & Chaat', icon: '🍲', cat: 'Panipuri & Chaat Lari' },
            { label: 'Paan Parlour', icon: '🍃', cat: 'Pan Masala & Paan Parlour' },
            { label: 'Mochi & Cobbler', icon: '👞', cat: 'Mochi & Shoe Repair' },
            { label: 'Hair Saloon', icon: '✂️', cat: 'Hair Saloon & Grooming' },
            { label: 'Chai & Nasta', icon: '☕', cat: 'Chai Kitli & Nasta Point' },
            { label: 'Cycle Puncture', icon: '🚲', cat: 'Cycle & Puncture Repair' },
            { label: 'Kirana & Grocery', icon: '🛒', cat: 'Grocery & Kirana' },
            { label: 'Dawai & Medical', icon: '💊', cat: 'Pharmacy & Medical' },
            { label: 'Dairy & Sweets', icon: '🥛', cat: 'Bakery & Dairy' },
            { label: 'Vakeel & CA Advisors', icon: '⚖️', cat: 'Advocate & Legal Services' },
            { label: 'Mobile & Electric', icon: '📱', cat: 'Electronics & Mobile' },
          ].map((item, i) => (
            <Link
              key={i}
              href={`/explore?category=${encodeURIComponent(item.cat)}`}
              className="flex flex-col items-center min-w-[90px] group text-center hover:opacity-95"
            >
              <div className="w-12 h-12 rounded-full bg-[#f1f3f6] group-hover:bg-[#e0f2fe] flex items-center justify-center text-xl transition-all shadow-xs group-hover:scale-105">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#2874f0] mt-1.5 leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. HERO BANNER: Direct Flipkart Seller Hub Style with the Generated Image */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-12 space-y-8">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left: Animated Multi-Category Hero Slider (Marked in User Screenshot) */}
            <div
              className="lg:col-span-7 relative min-h-[360px] sm:min-h-[440px] bg-slate-950 overflow-hidden group select-none"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {heroSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className={`object-cover object-center transition-transform duration-1000 ${isActive ? 'scale-105' : 'scale-100'
                        }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/40" />

                    {/* 3D Animated Category Badge Overlay */}
                    <div className={`absolute top-5 right-5 sm:top-7 sm:right-7 bg-gradient-to-b ${slide.badgeColor} text-slate-950 font-black p-3.5 sm:p-4 rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
                      }`}>
                      <span className="block text-2xl sm:text-3xl leading-none tracking-tight">{slide.badgeText}</span>
                      <span className="block text-[10px] sm:text-xs font-black uppercase tracking-wider">{slide.badgeUnit}</span>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-slate-800">{slide.badgeSub}</span>
                    </div>

                    {/* Animated Text Content on Banner */}
                    <div className="absolute bottom-12 left-5 right-5 sm:bottom-14 sm:left-7 sm:right-7">
                      <div className={`transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}>
                        <span className={`${slide.chipBg} text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-sm uppercase tracking-wider inline-flex items-center gap-1.5 mb-2 shadow`}>
                          <span>{slide.chip}</span>
                        </span>
                        <span className="bg-black/60 backdrop-blur-xs text-[#ffe500] text-[10px] sm:text-xs font-bold px-2 py-1 rounded-sm ml-2 hidden sm:inline-block border border-yellow-400/30">
                          {slide.tagline}
                        </span>
                      </div>

                      <h2 className={`text-white text-xl sm:text-2xl font-black drop-shadow-md leading-tight mt-1 transition-all duration-500 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}>
                        {slide.title}
                      </h2>
                      <p className={`text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2 max-w-xl transition-all duration-500 delay-300 drop-shadow-xs ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                        }`}>
                        {slide.desc}
                      </p>
                    </div>
                  </div>
                );
              })}




            </div>

            {/* Right: Registration & Quick Action Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center bg-white border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold w-fit mb-3 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hyperlocal Live Marketplace</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Grow your local shop by <span className="text-[#2874f0]">40%+ sales</span> with nearby residents
              </h2>
              <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
                Reach thousands of verified shoppers living in your 1-5km neighborhood. Turn your live status ON with 1 tap, reply to reverse item enquiries, and take direct orders.
              </p>

              {/* Registration Form Box */}
              <form onSubmit={handleQuickRegister} className="space-y-3 bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enter 10 Digit Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-200 text-slate-700 px-3 py-2.5 rounded-sm text-sm font-bold flex items-center">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 bg-white border border-slate-300 rounded-sm px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#fb641b] hover:bg-[#e65100] text-white font-extrabold text-sm py-3 rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Selling at 0% Commission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Shopper link */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Are you a customer / shopper?</span>
                <Link href="/explore" className="font-bold text-[#2874f0] hover:underline flex items-center gap-1">
                  <span>Explore nearby shops</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4. High-Trust Metrics Bar (Directly from Flipkart Seller Hub screenshot) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-[#f8fafc] border-t border-slate-200 py-4 px-2">
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">14 Lakh+</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Seller community</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">24×7</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Hyperlocal Business</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">0%</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Zero platform commission</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">1 - 5 KM</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Immediate radius served</p>
            </div>
          </div>
        </div>

        {/* 4.5. Vocal for Local & Digital India Movement Section */}
        <section className="bg-gradient-to-r from-orange-500/10 via-white to-emerald-500/10 rounded-2xl border-2 border-orange-200 shadow-md p-6 sm:p-8 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Image Artwork */}
            <div className="lg:col-span-5 relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="/vocal-for-local.jpg"
                alt="Vocal for Local & Digital India Bharat Movement"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-black">
                <span className="bg-orange-600 px-2 py-1 rounded shadow">🇮🇳 Vocal for Local</span>
                <span className="bg-emerald-700 px-2 py-1 rounded shadow">Digital India</span>
              </div>
            </div>

            {/* Right: Slogan, Meaning & Benefits */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                  🇮🇳 Desh Ka Swabhiman
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ⚡ 0% Middleman Commission
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  🗺️ Google Maps Live Tracking
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  <span className="text-orange-600">“Local Khareedo, Desh Badhao”</span> — Har Rupiya Apne Mohalle Me!
                </h2>
                <p className="text-sm font-bold text-slate-700 mt-1 italic">
                  “Digital Bharat, Samriddh Bharat — Har Dukaan Digital, Har Vyapari Sashakt!”
                </p>
              </div>

              {/* In-depth Meaning of Vocal for Local & Digital India */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/95 p-3.5 rounded-xl border border-orange-200 shadow-2xs space-y-1">
                  <div className="font-extrabold text-orange-900 flex items-center gap-1.5 text-xs">
                    <Heart className="w-4 h-4 text-orange-600 fill-orange-500 flex-shrink-0" />
                    <span>Vocal for Local Ka Asli Matlab:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Badi MNC delivery companiyaan har order pe 25% se 30% commission le jaati hain. Dukan Bari ke saath 100% paisa aapke padosi dukandar, chaat lari, ya local service provider ke bank khate me rehta hai.
                  </p>
                </div>

                <div className="bg-white/95 p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Digital India Ka Sankalp:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Bharat ke 14 lakh+ physical vyapariyon ko Google Map live navigation, direct QR UPI payments, aur hyperlocal reverse broadcasting se digitally saksham banana taaki offline dukaanein badhein.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/explore"
                  className="px-5 py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1759c9] text-white font-black text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <Navigation2 className="w-3.5 h-3.5" />
                  <span>Explore Local Mohalla Stores on Google Maps</span>
                </Link>

                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-sm bg-[#ffe500] hover:bg-[#f5b500] text-[#2874f0] font-black text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Register Local Dukaan (Free 0%)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. "Why do sellers & shoppers love Dukan Bari?" (Direct Flipkart Question Header) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why do <span className="text-[#2874f0]">local shopkeepers</span> love selling on Dukan Bari?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Over 10,000 physical retail stores trust Dukan Bari to connect with neighborhood residents living within 1 to 5 km.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-[#2874f0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2874f0] flex items-center justify-center text-xl font-bold mb-4">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">0% Commission Guaranteed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unlike giant aggregators who charge 20% to 30% per order, Dukan Bari lets you keep 100% of your retail margin. Direct counter pickup and direct UPI payments!
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-[#2874f0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">1-Tap Live Status Toggle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you open your shop shutter in the morning, tap "DUKAN KHULI HAI". Your shop instantly turns live on user maps, feeds, and search results within 5 km!
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-[#2874f0] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Reverse Enquiry Radar Desk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nearby shoppers broadcast items they need (e.g. "Basmati Rice 5kg" or medicine). Reply in 1 tap with price & availability to win the order before competitors!
              </p>
            </div>
          </div>
        </section>

        {/* 6. How it Works in 3 Simple Steps */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-2">
            Start Selling in 3 Simple Steps
          </h2>
          <p className="text-xs text-slate-600 text-center mb-8">
            Take your physical counter online in less than 5 minutes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#2874f0] text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-2">Register with Phone & Location</h4>
              <p className="text-xs text-slate-600">
                Enter your mobile number, shop name, retail category, and pin your physical location on the map.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#2874f0] text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-2">Toggle "LIVE OPEN" in 1 Tap</h4>
              <p className="text-xs text-slate-600">
                Whenever your shop is open, toggle the live button. Nearby residents immediately see your store open.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#f8fafc] border border-slate-200 text-center relative">
              <div className="w-10 h-10 rounded-full bg-[#2874f0] text-white font-black text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-2">Receive Chats & Enquiries</h4>
              <p className="text-xs text-slate-600">
                Answer customer queries, quote prices for reverse item searches, and broadcast limited-time flash deals!
              </p>
            </div>
          </div>
        </section>

        {/* 7. Dedicated Role Launchpad (Easy 1-Tap Switching for Testing & Access) */}
        <section className="bg-slate-900 text-white rounded-xl shadow-xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#ffe500]">
                ⚡ Platform Role Portals
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Experience All 3 User Views Right Now
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click any role to launch its live dashboard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Superadmin Card */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Superadmin Portal</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Platform health analytics, merchant KYC verification queue, geofence zones, and global broadcast alerts.
                </p>
              </div>
              <Link
                href="/admin"
                onClick={() => setMockRole('superadmin')}
                className="w-full py-2.5 rounded-sm bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Superadmin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Dukandar Card */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-[#fb641b]/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#fb641b]/20 text-[#fb641b] flex items-center justify-center font-bold mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Dukandar (Shopkeeper) Desk</h3>
                <p className="text-xs text-slate-400 mb-4">
                  1-Tap live toggle for open/closed, reverse enquiry desk, and flash sales with geofenced push alerts.
                </p>
              </div>
              <Link
                href="/merchant"
                onClick={() => setMockRole('shop_owner')}
                className="w-full py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e65100] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Dukandar Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Customer Card */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-[#2874f0]/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#2874f0]/20 text-[#2874f0] flex items-center justify-center font-bold mb-4">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Khareedar (Customer) Feed</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Hyperlocal store discovery (1-5km radius), live open/closed badges, reverse item enquiry broadcast, and 1-to-1 live chats.
                </p>
              </div>
              <Link
                href="/explore"
                onClick={() => setMockRole('customer')}
                className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1759c9] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Customer Feed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-slate-400 py-10 px-6 border-t border-slate-700 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Store className="w-5 h-5 text-[#ffe500]" />
            <span>Dukan Bari · Hyperlocal Physical Retail Platform</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/explore" className="hover:text-white">Explore 1-5km</Link>
            <Link href="/signup" className="hover:text-white">Dukandar Bano (0% Fee)</Link>
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
          <p>© 2026 Dukan Bari Platform. Built for Indian Local Retail Stores.</p>
        </div>
      </footer>
    </div>
  );
}
