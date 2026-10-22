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
  ChevronDown,
  ChevronUp,
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
  Navigation2,
  Briefcase,
  Scale,
  Calculator,
  Stethoscope,
  Scissors,
  Wrench,
  UtensilsCrossed,
  MessageSquare,
  BadgeCheck,
  Star,
  Users,
  Coins
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, profile, role, signOut, setMockRole } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [hasStoreSession, setHasStoreSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dukan_auth_token');
      const isStoreRole = role === 'shop_owner' || profile?.role === 'shop_owner' || Boolean(profile?.store_id);
      setHasStoreSession(Boolean(token && (user || profile) && isStoreRole));
    }
  }, [user, profile, role]);

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
    }
  ];

  // Auto-play timer for hero banner slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
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

  const faqs = [
    {
      q: 'How does Dukan Bari charge 0% commission from local merchants?',
      a: 'Unlike multinational aggregator apps that deduct 20% to 33% from every transaction, Dukan Bari operates on a direct neighborhood discovery model. Customers pay directly to your counter via your existing Google Pay, PhonePe, Paytm QR or cash. We do not intermediate payments or pocket middleman cuts.'
    },
    {
      q: 'Can professional service providers like Advocates, CAs, and Tailors register?',
      a: 'Yes, absolutely! Dukan Bari is built for both retail physical stores and verified local service providers. Advocates can list their legal chambers, CAs and tax practitioners can accept ITR/GST consultations, tailors can offer garment alteration quotes, and electricians/plumbers can receive local booking enquiries.'
    },
    {
      q: 'How do Customer Reviews & Star Ratings work on Dukan Bari?',
      a: 'Verified neighborhood customers can rate physical counters from 1 to 5 stars and leave helpful feedback. Ratings update the store’s public score in real-time, helping trusted local merchants build digital goodwill and attract more shoppers.'
    },
    {
      q: 'How does the "1-Tap Live Status" switch work?',
      a: 'Whenever you open your shop or start taking counter orders in the morning, tap "LIVE OPEN" on your merchant dashboard. Your store immediately lights up with a green pulsing badge on the local radar map, notifying shoppers within 5 km that you are actively serving customers.'
    },
    {
      q: 'How do customers navigate to my physical shop?',
      a: 'Every registered store receives a verified Google Maps live navigation pin. When a customer taps "Navigate", their phone opens Google Maps GPS with turn-by-turn walking or driving directions straight to your shop door.'
    }
  ];

  const merchantStories = [
    {
      name: 'Rameshwar Patel',
      shop: 'Patel Kirana & General Store',
      location: 'Varachha, Surat',
      extraRevenue: '+₹34,500 / month',
      text: 'Earlier we were losing daily orders to quick commerce 10-minute apps. With Dukan Bari, our neighborhood families message us directly and pick up groceries on their way home. 100% payment comes straight to our UPI QR!',
      rating: 5,
      badge: 'Kirana Verified'
    },
    {
      name: 'Advocate Sanjeev Sharma',
      shop: 'Sharma & Associates Legal Chambers',
      location: 'Civil Lines, Delhi',
      extraRevenue: '+22 New Clients / month',
      text: 'Local residents frequently needed property registration verification and notary work but did not know who to trust nearby. Listing our chamber on Dukan Bari brought regular, verified client consultations right to our office.',
      rating: 5,
      badge: 'High Court Chamber'
    },
    {
      name: 'Pooja & Mahendra Sen',
      shop: 'Classic Hair Saloon & Spa',
      location: 'Satellite, Ahmedabad',
      extraRevenue: '+45% Weekend Bookings',
      text: 'The 1-Tap Live Open toggle is incredible. When our salon chairs are free in the afternoon, we broadcast a quick 20% discount offer to nearby residents, and walk-ins fill up within 15 minutes!',
      rating: 5,
      badge: 'Salon Certified'
    }
  ];

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
              placeholder="Search local shops, advocates, doctors, grocery, medicines nearby..."
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
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Link
              href="/explore"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#ffe500] transition-colors py-1 px-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ffe500]" />
              <span>Explore Nearby (1-5km)</span>
            </Link>

            {/* Manage Store button: strictly rendered ONLY if store account is logged in and session token exists */}
            {hasStoreSession && (
              <Link
                href="/merchant"
                className="bg-[#ffe500] text-[#2874f0] hover:bg-[#f5b500] font-extrabold text-xs px-3.5 py-2 rounded-sm shadow-sm transition-all flex items-center gap-1.5 animate-fadeIn"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Manage Store</span>
              </Link>
            )}

            {user || profile ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-bold text-white bg-blue-700/60 px-2.5 py-1 rounded-sm border border-blue-400/30 truncate max-w-[120px]">
                  {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'My Account'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-3 py-2 rounded-sm transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white text-[#2874f0] hover:bg-slate-100 font-extrabold text-xs px-4 py-2 rounded-sm shadow-sm transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="p-2.5 bg-[#2874f0] border-t border-blue-400/30 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops or services nearby..."
              className="w-full bg-white text-slate-800 text-xs px-3.5 py-2 rounded-sm"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-[#2874f0]">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </header>

      {/* 2. Top Categories Strip (Flipkart-style circular items)
      <section className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {[
            { label: 'Panipuri & Chaat', icon: '🍲', cat: 'Panipuri & Chaat Lari' },
            { label: 'Paan Parlour', icon: '🍃', cat: 'Pan Masala & Paan Parlour' },
            { label: 'Kirana & Grocery', icon: '🛒', cat: 'Grocery & Kirana' },
            { label: 'Vakeel & Legal', icon: '⚖️', cat: 'Advocate & Legal Advisory' },
            { label: 'CA & Tax GST', icon: '📊', cat: 'CA & Tax Advisor (GST/ITR)' },
            { label: 'Doctor Clinics', icon: '🩺', cat: 'Doctor & Clinic Consultation' },
            { label: 'Hair Saloon', icon: '✂️', cat: 'Hair Saloon & Grooming' },
            { label: 'Tailor & Stitch', icon: '🧵', cat: 'Tailor & Stitching Alterations' },
            { label: 'Chai & Nasta', icon: '☕', cat: 'Chai Kitli & Nasta Point' },
            { label: 'Dawai & Medical', icon: '💊', cat: 'Pharmacy & Medical' },
            { label: 'Electric & AC', icon: '⚡', cat: 'Electrician & Wireman' },
            { label: 'Mochi & Cobbler', icon: '👞', cat: 'Mochi & Footwear Repair' },
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
      </section> */}

      {/* 3. HERO BANNER: Multi-Category Slider & Quick Onboarding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-12 space-y-10">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left: Animated Multi-Category Hero Slider */}
            <div
              className="lg:col-span-7 relative min-h-[360px] sm:min-h-[460px] bg-slate-950 overflow-hidden group select-none"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/50" />

                    {/* 3D Animated Category Badge Overlay */}
                    <div
                      className={`absolute top-5 right-5 sm:top-7 sm:right-7 bg-gradient-to-b ${slide.badgeColor} text-slate-950 font-black p-3.5 sm:p-4 rounded-2xl shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
                        }`}
                    >
                      <span className="block text-2xl sm:text-3xl leading-none tracking-tight">{slide.badgeText}</span>
                      <span className="block text-[10px] sm:text-xs font-black uppercase tracking-wider">{slide.badgeUnit}</span>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-slate-800">{slide.badgeSub}</span>
                    </div>

                    {/* Animated Text Content on Banner */}
                    <div className="absolute bottom-12 left-5 right-5 sm:bottom-14 sm:left-7 sm:right-7">
                      <div
                        className={`transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                          }`}
                      >
                        <span className={`${slide.chipBg} text-white text-[11px] sm:text-xs font-black px-3 py-1 rounded-sm uppercase tracking-wider inline-flex items-center gap-1.5 mb-2 shadow`}>
                          <span>{slide.chip}</span>
                        </span>
                        <span className="bg-black/60 backdrop-blur-xs text-[#ffe500] text-[10px] sm:text-xs font-bold px-2 py-1 rounded-sm ml-2 hidden sm:inline-block border border-yellow-400/30">
                          {slide.tagline}
                        </span>
                      </div>

                      <h2
                        className={`text-white text-xl sm:text-2xl font-black drop-shadow-md leading-tight mt-1 transition-all duration-500 delay-200 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                          }`}
                      >
                        {slide.title}
                      </h2>
                      <p
                        className={`text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2 max-w-xl transition-all duration-500 delay-300 drop-shadow-xs ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                          }`}
                      >
                        {slide.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Slider Dots */}
              <div className="absolute bottom-3 left-6 z-20 flex gap-1.5">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-[#ffe500]' : 'w-2 bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Registration & Quick Action Box */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center bg-white border-t lg:border-t-0 lg:border-l border-slate-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold w-fit mb-3 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>India's Hyperlocal Business Network</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Grow your shop & chamber by <span className="text-[#2874f0]">40%+ direct orders</span>
              </h2>
              <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
                Connect with neighborhood residents living within 1 to 5 km. Zero corporate cuts, 1-tap live counter status, and instant direct UPI settlement into your own bank account.
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
                  <span>Start at 0% Commission (Free Registration)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Shopper link */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Are you looking to buy or consult?</span>
                <Link href="/explore" className="font-bold text-[#2874f0] hover:underline flex items-center gap-1">
                  <span>Explore nearby shops (1-5km)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4. High-Trust Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-[#f8fafc] border-t border-slate-200 py-4 px-2">
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">14 Lakh+</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Physical Retail Community</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">24×7</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Live Counter Visibility</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">0%</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Zero Platform Commission</p>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-[#2874f0]">1 - 5 KM</h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">Hyperlocal Neighborhood Radius</p>
            </div>
          </div>
        </div>

        {/* 4.1. DUAL SHOWCASE: Physical Retail Goods & Professional Services */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2874f0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Complete Hyperlocal Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Vyapaar Bhi, Professional Services Bhi — Ek Hi Platform Par!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Whether you need daily milk and fresh groceries or certified legal and taxation advice, find trusted neighborhood experts within minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column A: Physical Retail & Goods */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2874f0] text-white flex items-center justify-center shadow">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#ffe500] text-[#1a5bc7]">
                    0% Commission Direct
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Retail Goods, Grocery & Food Stalls</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Kirana stores, fresh milk dairies, vegetable thelas, chaat laris, farsan mart & medical shops connect directly with neighborhood families.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  {[
                    { title: 'Live Counter MRP', desc: 'Accurate shelf pricing with 0% inflated markups.' },
                    { title: '1-Tap Live Switch', desc: 'Shop shutter open? Toggle online in 1 second.' },
                    { title: 'Instant Pickup', desc: 'Order via chat & pick up packed bag in 5 mins.' },
                    { title: 'Direct UPI Cash', desc: 'Money goes directly to your merchant QR code.' },
                  ].map((feat, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat.title}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/explore?category=Grocery+%26+Kirana"
                className="w-full py-3 bg-[#2874f0] hover:bg-[#1a5bc7] text-white rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <span>Browse Local Goods & Food Counters</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Column B: Professional Certified Services */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/60 to-slate-50 border border-purple-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow">
                    <Scale className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-purple-100 text-purple-900 border border-purple-200">
                    Verified Professionals
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Certified Legal, Tax & Skilled Services</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Advocates, CA tax advisors, registered clinics, boutique tailors, hair saloons & appliance technicians serving verified clients in their pincode.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  {[
                    { title: '1-to-1 Chamber Chat', desc: 'Direct confidential consultation with certified lawyers & CAs.' },
                    { title: 'Custom Price Quotes', desc: 'Send customized quotes for deed drafting or ITR filing.' },
                    { title: 'Verified Pincode Trust', desc: 'Build long-term advisory relationships with local citizens.' },
                    { title: 'Chamber Appointments', desc: 'Clients book office visits with Google Maps navigation.' },
                  ].map((feat, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span>{feat.title}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/explore?category=Advocate+%26+Legal+Services"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <span>Find Advocates, CAs & Services Nearby</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4.2. HOW CUSTOMER REVIEWS & LOCAL RATINGS WORK */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-2 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#ffe500] bg-white/10 px-3 py-1 rounded-full border border-white/15">
              ⭐ Real Customer Reviews & Ratings
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Trusted Neighborhood Ratings & Real-Time Feedback
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Shoppers rate local shops from 1 to 5 stars. Real ratings update the store’s profile live, building genuine trust across your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#ffe500] text-slate-900 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h4 className="font-extrabold text-sm text-white">Shoppers Give Star Ratings</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Customers choose 1 to 5 stars and share brief comments about counter service, freshness, and delivery speed.
              </p>
              <div className="p-2.5 bg-black/40 rounded-lg text-[11px] text-[#ffe500] border border-white/10 font-mono">
                ⭐ 5-Star: "Fresh vegetables and polite uncle!"
              </div>
            </div>

            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-400 text-slate-900 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h4 className="font-extrabold text-sm text-white">Live Average Recalculated</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supabase recalculates the store’s average rating and total review count in real-time, syncing across all discovery cards.
              </p>
              <div className="p-2.5 bg-black/40 rounded-lg text-[11px] text-emerald-300 border border-white/10 font-mono">
                📈 Store Score Updated: 4.9 ★ (128 Reviews)
              </div>
            </div>

            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#2874f0] text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h4 className="font-extrabold text-sm text-white">Nearby Customers Trust & Buy</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                High ratings attract neighbors on the Explore page, turning happy local customers into repeat daily walk-in shoppers.
              </p>
              <div className="p-2.5 bg-black/40 rounded-lg text-[11px] text-blue-200 border border-white/10 font-mono">
                ✓ Verified Counter Badge Displayed Live
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 relative z-10">
            <Link
              href="/explore"
              className="px-6 py-3 rounded-lg bg-[#ffe500] hover:bg-[#ebd300] text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>Explore Verified Local Stores</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-xs text-slate-400 font-semibold">
              ✦ Verified reviews from authentic neighborhood shoppers
            </span>
          </div>
        </section>

        {/* 4.3. COMPARISON TABLE: Dukan Bari vs Aggregator Delivery Apps */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Fair Trade & Direct Margins
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dukan Bari vs Corporate Aggregator Apps
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              See why physical retailers and service providers are choosing direct neighborhood discovery over high-commission platforms.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 font-black text-slate-900">Platform Features</th>
                  <th className="p-4 font-black text-[#2874f0] bg-blue-50/80">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#2874f0]" />
                      <span>Dukan Bari (0% Platform)</span>
                    </div>
                  </th>
                  <th className="p-4 font-bold text-slate-500">Corporate Delivery Aggregators</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Commission Deductions</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ 0% Guaranteed (Keep 100% Margin)
                  </td>
                  <td className="p-4 text-rose-600 font-bold">25% to 33% cut per order</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Payment Settlement Time</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ Instant Direct UPI into Merchant Bank
                  </td>
                  <td className="p-4 text-slate-500">Delayed 7 to 14 days with holdbacks</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Direct Customer Connection</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ Direct 1-to-1 Live Socket Chat & Phone
                  </td>
                  <td className="p-4 text-slate-500">Hidden behind masked phone relays</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Physical Store GPS Navigation</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ Real-time Google Maps walking destination
                  </td>
                  <td className="p-4 text-slate-500">Only delivery courier tracking</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Certified Professional Services</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ Welcomed: Lawyers, CAs, Clinics, Tailors
                  </td>
                  <td className="p-4 text-slate-500">Strictly food or packaged warehouse grocery</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Street Vendors & Larivalas</td>
                  <td className="p-4 font-black text-emerald-700 bg-blue-50/40">
                    ✓ 100% Welcomed & Crossroad Radar Mapped
                  </td>
                  <td className="p-4 text-slate-500">Excluded (Warehouse dark-stores preferred)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4.4. VOCAL FOR LOCAL & DIGITAL INDIA SECTION */}
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

        {/* 4.5. VERIFIED MERCHANT STORIES & TESTIMONIALS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Verified Merchant Voices
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trusted by 10,000+ Shopkeepers and Certified Professionals
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Read how small business owners and professional consultants are unlocking extra local income every single month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {merchantStories.map((story, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 hover:border-[#2874f0] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#2874f0]">
                      {story.badge}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(story.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{story.text}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{story.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">{story.shop} · {story.location}</p>
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    {story.extraRevenue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4.6. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#2874f0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600">
              Everything you need to know about setting up your counter, taking direct orders, and zero commission guarantee.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all bg-[#f8fafc]"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-slate-900 hover:text-[#2874f0] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#2874f0] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Role Portals Launchpad */}
        <section className="bg-slate-900 text-white rounded-xl shadow-xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#ffe500]">
                ⚡ Direct Portals
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Explore Platform Portals
              </h2>
            </div>
            <span className="text-xs text-slate-400">Launch verified dukandar or shopper view</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Dukandar Card */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-[#fb641b]/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#fb641b]/20 text-[#fb641b] flex items-center justify-center font-bold mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Dukandar Studio</h3>
                <p className="text-xs text-slate-400 mb-4">
                  1-Tap live toggle for open/closed, catalog management, and flash sales with geofenced updates.
                </p>
              </div>
              <Link
                href="/merchant"
                onClick={() => setMockRole('shop_owner')}
                className="w-full py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e65100] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Dukandar Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Customer Card */}
            <div className="p-6 rounded-xl bg-slate-800/80 border border-[#2874f0]/30 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#2874f0]/20 text-[#2874f0] flex items-center justify-center font-bold mb-4">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Customer Explorer</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Hyperlocal store discovery (1-5km radius), live open/closed badges, verified ratings & reviews, and 1-to-1 live chats.
                </p>
              </div>
              <Link
                href="/explore"
                onClick={() => setMockRole('customer')}
                className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1759c9] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-slate-400 py-12 px-6 border-t border-slate-700 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-base">
                <Store className="w-5 h-5 text-[#ffe500]" />
                <span>Dukan Bari Plus</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                India's premier hyperlocal physical retail discovery and direct live merchant platform. Empowering local shopkeepers, street vendors, and certified service providers with 0% commission.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffe500]">
                <span>🇮🇳 Vocal for Local & Digital India Bharat</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Explore Categories</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/explore?category=Grocery+%26+Kirana" className="hover:text-white">Grocery & Kirana Stores</Link></li>
                <li><Link href="/explore?category=Panipuri+%26+Chaat+Lari" className="hover:text-white">Panipuri & Chaat Laris</Link></li>
                <li><Link href="/explore?category=Pharmacy+%26+Medical" className="hover:text-white">24×7 Medical Stores</Link></li>
                <li><Link href="/explore?category=Advocate+%26+Legal+Services" className="hover:text-white">Advocates & Legal Chambers</Link></li>
                <li><Link href="/explore?category=CA+%26+Tax+Advisors" className="hover:text-white">CA & Tax Practitioners</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Merchant Hub</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/signup" className="hover:text-white">Register Store (0% Fee)</Link></li>
                <li><Link href="/merchant" className="hover:text-white">Merchant Studio Desk</Link></li>
                <li><Link href="/login" className="hover:text-white">Seller Login</Link></li>
                <li><span className="text-emerald-400 font-bold">100% Direct UPI Settlement</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Direct Support & Trust</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Need assistance setting up your counter or verifying your legal chamber? Our hyperlocal merchant onboarding desk is ready to help.
              </p>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-[11px] text-slate-300">
                <span className="font-bold text-white block">Hyperlocal Support Helpline</span>
                <span>support@dukanbari.in · 1800-LOCAL-DUKAN</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 Dukan Bari Hyperlocal Network. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Merchant Code of Conduct</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
