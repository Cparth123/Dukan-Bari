'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
  Share2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Scale,
  Utensils,
  Plus,
  Send,
  X,
  ShoppingBag,
  Navigation2,
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CatalogItem {
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

interface StoreBusinessData {
  id: string;
  name: string;
  businessType: 'retail' | 'legal_advocate' | 'tax_advisor' | 'restaurant_food' | 'pharmacy';
  category: string;
  badgeTitle: string;
  address: string;
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
  const { signOut } = useAuth();

  const storeId = (params?.id as string) || 'store-1';
  const initialSelectedProduct = searchParams?.get('product') || '';

  const [inStoreSearch, setInStoreSearch] = useState('');
  const [selectedProductHighlight, setSelectedProductHighlight] = useState<string>(initialSelectedProduct);
  const [activeCatalogTab, setActiveCatalogTab] = useState('All');

  // Direct Live Chat modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'store', text: 'Namaste! How can we assist you with our services/products today?', time: 'Just now' }
  ]);

  // Mock database of local business models (Advocates, CA, Kirana, Dhaba, Pharmacy)
  const businessDirectory: { [key: string]: StoreBusinessData } = {
    'store-1': {
      id: 'store-1',
      name: 'Gupta General Store & Provisions',
      businessType: 'retail',
      category: 'Grocery & Kirana',
      badgeTitle: 'Local Kirana Dukaan',
      address: 'Shop 14, Main Market, Sector 5, New Delhi',
      distanceKm: 0.6,
      walkMinutes: 4,
      rating: 4.8,
      reviewsCount: 342,
      isLiveOpen: true,
      statusBadge: 'Live Open · Closes at 9:30 PM',
      badgeBg: 'bg-emerald-600 text-white',
      bannerImg: '/gupta-store.jpg',
      phone: '+91 9876543210',
      whatsapp: '+91 9876543210',
      activeDeal: 'FLAT 15% OFF on Dal & Pulses',
      workingHours: '8:00 AM - 10:00 PM (Everyday)',
      aboutText: 'Trusted local family grocery store serving Sector 5 since 1994. Fresh daily chakki atta, premium basmati rice, mustard & sunflower oils, and all household essentials at wholesale prices.',
      catalog: [
        {
          id: 'prod-1',
          name: 'Ashirwad Chakki Atta',
          categoryTag: 'Flours & Grains',
          price: 420,
          mrp: 460,
          discountPercent: 9,
          unitOrDuration: '10 kg Pack',
          description: '100% pure whole wheat stone ground chakki atta with natural aroma, high dietary fiber and soft rotis.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/grocery-product.jpg',
          specs: ['100% Whole Wheat', 'Stone Ground Chakki', 'Soft Rotis Guarantee']
        },
        {
          id: 'prod-2',
          name: 'Sunehri Gold Sunflower Oil',
          categoryTag: 'Cooking Oils',
          price: 650,
          mrp: 720,
          discountPercent: 10,
          unitOrDuration: '5 Litre Can',
          description: 'Refined sunflower cooking oil enriched with Vitamins A & D, heart friendly, non-sticky texture.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/grocery-product.jpg',
          specs: ['Enriched with Vit A & D', 'Zero Cholesterol', 'Triple Filtered']
        },
        {
          id: 'prod-3',
          name: 'Kohinoor Basmati Rice Extra Long',
          categoryTag: 'Flours & Grains',
          price: 380,
          mrp: 440,
          discountPercent: 14,
          unitOrDuration: '5 kg Bag',
          description: 'Aged extra long grain fragrant basmati rice perfect for daily biryani, pulao, and festive meals.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/grocery-product.jpg',
          specs: ['2 Years Naturally Aged', 'Extra Long Royal Grains', 'Signature Aroma']
        },
        {
          id: 'prod-4',
          name: 'Tata Salt Vacuum Evaporated',
          categoryTag: 'Spices & Essentials',
          price: 28,
          mrp: 30,
          discountPercent: 7,
          unitOrDuration: '1 kg Pack',
          description: 'Vacuum evaporated iodized table salt with purity seal, essential for mental development and balanced nutrition.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/grocery-product.jpg',
          specs: ['Vacuum Evaporated', 'Iodized Purity', 'Desh Ka Namak']
        },
        {
          id: 'prod-5',
          name: 'MDH Deggi Mirch & Garam Masala',
          categoryTag: 'Spices & Essentials',
          price: 95,
          mrp: 110,
          discountPercent: 14,
          unitOrDuration: '100g Box',
          description: 'Rich red color and authentic Punjabi aroma spice blend from hand-picked roasted herbs and whole spices.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/grocery-product.jpg',
          specs: ['Natural Deggi Red', 'No Added Preservatives', 'Aroma Lock Packaging']
        },
        {
          id: 'prod-6',
          name: 'Amul Butter Salted',
          categoryTag: 'Dairy & Breakfast',
          price: 58,
          mrp: 62,
          discountPercent: 6,
          unitOrDuration: '100g Pack',
          description: 'Pure pasteurized cow & buffalo milk butter, utterly butterly delicious breakfast classic.',
          inStock: true,
          stockStatusText: 'In Stock - Cold Storage Fresh',
          itemType: 'product',
          image: '/dairy-products.jpg',
          specs: ['Cold Storage Fresh', 'Pasteurized Cream', 'Utterly Butterly Delicious']
        }
      ]
    },
    'store-advocate': {
      id: 'store-advocate',
      name: 'Sharma & Associates Advocates & Legal Advisors',
      businessType: 'legal_advocate',
      category: 'Advocate & Legal Services',
      badgeTitle: 'High Court & District Chamber',
      address: 'Chamber 204, Lawyers Complex, Sector 5, New Delhi',
      distanceKm: 0.4,
      walkMinutes: 3,
      rating: 4.9,
      reviewsCount: 188,
      isLiveOpen: true,
      statusBadge: 'Advocate Chamber Live Open · Available for Consultations',
      badgeBg: 'bg-purple-700 text-white',
      bannerImg: '/advocate-office.jpg',
      phone: '+91 9811002233',
      whatsapp: '+91 9811002233',
      activeDeal: 'Free 10-Min Preliminary Tele-Consultation',
      workingHours: '10:00 AM - 7:00 PM (Mon - Sat)',
      aboutText: 'Senior Advocates practicing in High Court & District Courts. Specializing in Property Title Verification, Civil Disputes, RERA Matters, Legal Drafting, Affidavits, and Corporate Legal Advisory for local businesses.',
      catalog: [
        {
          id: 'serv-1',
          name: 'Legal Consultation & Document Review',
          categoryTag: 'Consultation',
          price: 500,
          mrp: 800,
          discountPercent: 37,
          unitOrDuration: '30 Mins Chamber Session',
          description: 'Direct 1-to-1 chamber consultation on property, civil dispute, matrimonial or business agreements.',
          inStock: true,
          stockStatusText: 'Slot Available Today',
          itemType: 'service',
          image: '/advocate-office.jpg',
          specs: ['30 Mins Chamber Session', 'High Court Practicing Advocate', '100% Confidential']
        },
        {
          id: 'serv-2',
          name: 'Property Sale Deed & Registry Verification',
          categoryTag: 'Property & Contracts',
          price: 1500,
          mrp: 2000,
          discountPercent: 25,
          unitOrDuration: 'Complete Title Search',
          description: 'Verification of 30-year land records, encumbrance certificate, registry authenticity and draft preparation.',
          inStock: true,
          stockStatusText: 'Available - 24hr Turnaround',
          itemType: 'service',
          image: '/advocate-office.jpg',
          specs: ['30-Year Title Search', 'Encumbrance Certificate Check', 'Draft Verification']
        },
        {
          id: 'serv-3',
          name: 'Affidavit, Rent Agreement & Notary Attestation',
          categoryTag: 'Documentation',
          price: 350,
          mrp: 500,
          discountPercent: 30,
          unitOrDuration: 'Same Day Delivery',
          description: 'Stamp paper notarized rental agreement, name change affidavits, partnership deeds prepared in 1 hour.',
          inStock: true,
          stockStatusText: 'Ready in 1 Hour',
          itemType: 'service',
          image: '/advocate-office.jpg',
          specs: ['Official Govt Stamp Paper', 'Notary Public Attested', 'Doorstep Delivery Option']
        },
        {
          id: 'serv-4',
          name: 'Consumer Court & Legal Notice Drafting',
          categoryTag: 'Litigation & Notice',
          price: 1200,
          mrp: 1800,
          discountPercent: 33,
          unitOrDuration: 'Official Notice with Dispatch',
          description: 'Drafting formal legal notices under Section 138 (Cheque Bounce), defective services or unpaid dues.',
          inStock: true,
          stockStatusText: 'Available - Same Day Dispatch',
          itemType: 'service',
          image: '/advocate-office.jpg',
          specs: ['Section 138 Notice', 'Speed Post with Tracking', 'Statutory Legal Backing']
        }
      ]
    },
    'store-food': {
      id: 'store-food',
      name: 'Punjab Dhaba & Family Restaurant',
      businessType: 'restaurant_food',
      category: 'Food, Dhabas & Restaurants',
      badgeTitle: 'Authentic Tandoor & Thali',
      address: 'Near Metro Gate 3, Sector 5 Market, New Delhi',
      distanceKm: 1.2,
      walkMinutes: 9,
      rating: 4.8,
      reviewsCount: 520,
      isLiveOpen: true,
      statusBadge: 'Tandoor Live Open · Serving Hot Food',
      badgeBg: 'bg-emerald-600 text-white',
      bannerImg: '/punjab-dhaba.jpg',
      phone: '+91 9822114455',
      whatsapp: '+91 9822114455',
      activeDeal: 'FREE Butter Roti on orders above ₹300',
      workingHours: '11:00 AM - 11:30 PM (Daily)',
      aboutText: 'Famous for smoky charcoal tandoori rotis, Dal Makhani, Paneer Butter Masala, and wholesome daily tiffin service with counter pickup and fast delivery.',
      catalog: [
        {
          id: 'food-1',
          name: 'Special Dal Makhani (Slow Cooked Overnight)',
          categoryTag: 'Main Course',
          price: 180,
          mrp: 210,
          discountPercent: 14,
          unitOrDuration: 'Full Handi (500ml)',
          description: 'Rich black lentils simmered with white butter, fresh cream, and traditional spices over charcoal tandoor.',
          inStock: true,
          stockStatusText: 'Fresh Hot - Ready at Counter',
          itemType: 'product',
          image: '/dhaba-thali.jpg',
          specs: ['12-Hour Charcoal Simmered', 'Amul Butter & Cream Swirl', 'Served Hot with Onions']
        },
        {
          id: 'food-2',
          name: 'Paneer Butter Masala',
          categoryTag: 'Main Course',
          price: 220,
          mrp: 260,
          discountPercent: 15,
          unitOrDuration: 'Full Handi (500ml)',
          description: 'Fresh malai paneer cubes in velvety tomato cashew gravy with aromatic kasuri methi and butter.',
          inStock: true,
          stockStatusText: 'Fresh Hot - Ready in 10 mins',
          itemType: 'product',
          image: '/dhaba-thali.jpg',
          specs: ['Fresh Malai Paneer Cubes', 'Cashew Tomato Velvet Gravy', 'Served with Green Chutney']
        },
        {
          id: 'food-3',
          name: 'Butter Tandoori Roti (Whole Wheat)',
          categoryTag: 'Breads',
          price: 15,
          mrp: 20,
          discountPercent: 25,
          unitOrDuration: '1 pc Hot Roti',
          description: 'Hot crisp clay tandoor baked whole wheat roti brushed with pure desi ghee/butter.',
          inStock: true,
          stockStatusText: 'Live Charcoal Tandoor Ready',
          itemType: 'product',
          image: '/dhaba-thali.jpg',
          specs: ['100% Whole Wheat', 'Clay Tandoor Baked', 'Desi Butter Brushed']
        },
        {
          id: 'food-4',
          name: 'Special Executive Punjabi Thali',
          categoryTag: 'Thali Meals',
          price: 199,
          mrp: 250,
          discountPercent: 20,
          unitOrDuration: 'Complete Meal Pack',
          description: 'Dal Makhani + Shahi Paneer + Jeera Rice + 4 Butter Rotis + Raita + Salad + Hot Gulab Jamun.',
          inStock: true,
          stockStatusText: 'Fresh Hot - Complete Meal Deal',
          itemType: 'product',
          image: '/dhaba-thali.jpg',
          specs: ['2 Premium Curries', '4 Butter Rotis + Jeera Rice', 'Raita + Salad + Gulab Jamun']
        }
      ]
    },
    'store-2': {
      id: 'store-2',
      name: 'Apollo 24/7 Chemist & Medical Pharmacy',
      businessType: 'pharmacy',
      category: 'Pharmacy & Medical',
      badgeTitle: 'Licensed Medical Store',
      address: 'Plot 3, Near Metro Gate 2, Sector 5, New Delhi',
      distanceKm: 1.1,
      walkMinutes: 8,
      rating: 4.9,
      reviewsCount: 410,
      isLiveOpen: true,
      statusBadge: 'Live Open 24/7',
      badgeBg: 'bg-emerald-600 text-white',
      bannerImg: '/apollo-pharmacy.jpg',
      phone: '+91 9811223344',
      whatsapp: '+91 9811223344',
      workingHours: 'Open 24 Hours · All 7 Days',
      aboutText: 'Complete neighborhood chemist store stocked with prescription medicines, surgical items, baby care, diabetic care, and emergency healthcare products.',
      catalog: [
        {
          id: 'med-1',
          name: 'Crocin Pain Relief 650mg Tablet',
          categoryTag: 'Fever & Pain',
          price: 32,
          mrp: 35,
          discountPercent: 9,
          unitOrDuration: 'Strip of 15 Tablets',
          description: 'Fast acting paracetamol formulation for fever, headache, body ache and dental pain relief.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/pharmacy-products.jpg',
          specs: ['Paracetamol 650mg', 'Expiry Year: 2028', 'Licensed Chemist Genuine']
        },
        {
          id: 'med-2',
          name: 'Dettol Antiseptic Disinfectant Liquid',
          categoryTag: 'First Aid',
          price: 85,
          mrp: 95,
          discountPercent: 11,
          unitOrDuration: '250 ml Bottle',
          description: 'Trusted antiseptic formula for first aid, cuts, grazes, bites, and personal hygiene protection.',
          inStock: true,
          stockStatusText: 'In Stock - Ready at Counter',
          itemType: 'product',
          image: '/pharmacy-products.jpg',
          specs: ['250 ml Bottle', '99.9% Germ Protection', 'First Aid Essential']
        },
        {
          id: 'med-3',
          name: 'Digital Blood Pressure Monitor (Omron)',
          categoryTag: 'Health Devices',
          price: 1850,
          mrp: 2250,
          discountPercent: 18,
          unitOrDuration: '1 Device with 3yr Warranty',
          description: 'Accurate clinical grade automatic digital BP monitor with memory storage, hypertension indicator and large cuff.',
          inStock: true,
          stockStatusText: 'In Stock - 3 Year Warranty',
          itemType: 'product',
          image: '/pharmacy-products.jpg',
          specs: ['Clinically Validated Accuracy', '3 Years Official Warranty', 'Memory for 60 Readings']
        }
      ]
    },
    'store-advisor': {
      id: 'store-advisor',
      name: 'Aggarwal & Co. Chartered Accountants & Tax Advisors',
      businessType: 'tax_advisor',
      category: 'CA & Tax Advisors',
      badgeTitle: 'ICAI Registered CA Firm',
      address: 'Office 203, 2nd Floor, Commercial Plaza, Sector 5, New Delhi',
      distanceKm: 0.5,
      walkMinutes: 4,
      rating: 4.9,
      reviewsCount: 215,
      isLiveOpen: true,
      statusBadge: 'Office Live Open · Available for Tax Consultation',
      badgeBg: 'bg-indigo-700 text-white',
      bannerImg: '/ca-advisor.jpg',
      phone: '+91 9810012345',
      whatsapp: '+91 9810012345',
      activeDeal: 'FLAT 20% OFF on Individual ITR Filing',
      workingHours: '9:30 AM - 7:30 PM (Mon - Sat)',
      aboutText: 'Experienced Chartered Accountants and tax consultants handling Income Tax returns, GST filing, ROC compliances, MSME registrations, project financing, and accounting audits for local traders and individuals.',
      catalog: [
        {
          id: 'ca-1',
          name: 'Income Tax Return (ITR 1 / 4) Filing & Computation',
          categoryTag: 'Income Tax',
          price: 799,
          mrp: 1200,
          discountPercent: 33,
          unitOrDuration: 'Per Assessment Year',
          description: 'Complete calculation, tax optimization, deductions check (80C, 80D), and instant e-filing with ITR-V acknowledgment.',
          inStock: true,
          stockStatusText: 'Available - E-File Today',
          itemType: 'service',
          image: '/ca-advisor.jpg',
          specs: ['AY 2026-27 Compliant', 'Max Tax Savings Check', 'Instant ITR-V Ack Receipt']
        },
        {
          id: 'ca-2',
          name: 'GST Monthly Return Filing (GSTR-1 & 3B)',
          categoryTag: 'GST & Indirect Tax',
          price: 1199,
          mrp: 1600,
          discountPercent: 25,
          unitOrDuration: 'Monthly Package',
          description: 'Reconciliation of sales and input tax credit (2B matching), monthly filing, and compliance certificate.',
          inStock: true,
          stockStatusText: 'Available - Monthly Package',
          itemType: 'service',
          image: '/ca-advisor.jpg',
          specs: ['Sales & 2B Matching', 'Zero Late Fee Guarantee', 'Govt Portal Certified']
        },
        {
          id: 'ca-3',
          name: 'New Private Limited / LLP Incorporation',
          categoryTag: 'Company Formation',
          price: 4999,
          mrp: 6500,
          discountPercent: 23,
          unitOrDuration: 'All Inclusive Package',
          description: 'Name approval (RUN), DSC, DIN, MOA/AOA drafting, Certificate of Incorporation, PAN & TAN in 7 days.',
          inStock: true,
          stockStatusText: 'Available - 7 Day Fastrack',
          itemType: 'service',
          image: '/ca-advisor.jpg',
          specs: ['2 DSC + 2 DIN Included', 'MOA & AOA Drafting', 'PAN + TAN + Bank Intro']
        },
        {
          id: 'ca-4',
          name: 'Financial Advisory & Business Loan Project Report',
          categoryTag: 'Financial Advisory',
          price: 2500,
          mrp: 3500,
          discountPercent: 28,
          unitOrDuration: 'Bank Ready CMA Data Report',
          description: 'CMA data preparation, 5-year balance sheet projections, DSCR calculation for MSME and business CC limit.',
          inStock: true,
          stockStatusText: 'Available - Bank Approved Format',
          itemType: 'service',
          image: '/ca-advisor.jpg',
          specs: ['Bank Ready CMA Data', '5-Year Balance Sheet Proj.', 'MSME & CC Limit Approved']
        }
      ]
    }
  };

  const [currentStore, setCurrentStore] = useState<StoreBusinessData>(
    businessDirectory[storeId] || businessDirectory['store-1']
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStore = localStorage.getItem('dukan_bari_my_store');
      const savedProducts = localStorage.getItem('dukan_bari_my_products');
      if (savedStore) {
        try {
          const s = JSON.parse(savedStore);
          setCurrentStore((prev) => ({
            ...prev,
            name: s.storeName || prev.name,
            category: s.category || prev.category,
            address: s.addressLine || prev.address,
            bannerImg: s.bannerUrl || prev.bannerImg,
            phone: s.phoneContact || prev.phone,
            whatsapp: s.whatsappNumber || prev.whatsapp,
            isLiveOpen: typeof s.isLiveOpen === 'boolean' ? s.isLiveOpen : prev.isLiveOpen,
            catalog: savedProducts ? JSON.parse(savedProducts) : prev.catalog,
          }));
        } catch (e) {
          console.error('Error applying dynamic store:', e);
        }
      }
    }
  }, [storeId]);

  // Identify the highlighted item if clicked or passed
  const spotlightItem = currentStore.catalog.find(
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

  const catalogCategories = ['All', ...Array.from(new Set(currentStore.catalog.map((c) => c.categoryTag)))];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: chatInput, time: 'Just now' }
    ]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans pb-16">
      {/* 1. Top Flipkart Blue Bar */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-white/10 rounded-sm text-white flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Discovery</span>
            </button>
            <div className="h-4 w-px bg-blue-300/40 hidden sm:block" />
            <span className="text-sm font-black italic tracking-tight hidden sm:inline">
              Dukan Bari Store & Service Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/merchant"
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-2.5 py-1.5 rounded-sm border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Store Owner Studio - Add/Edit Banner, Products, Offers in Supabase Store Bucket"
            >
              <Store className="w-3.5 h-3.5 text-[#ffe500]" />
              <span className="hidden sm:inline">Store Owner Studio</span>
            </Link>

            <button
              onClick={() => setShowChatModal(true)}
              className="bg-[#ffe500] text-[#2874f0] font-black text-xs px-3.5 py-1.5 rounded-sm shadow-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Live Chat (Poochhein)</span>
            </button>
            <Link href="/" className="text-xs font-bold text-white hover:text-blue-100">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* 2. STORE BANNER TOP (User Request: "open shopper store banner top") */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative">
            {currentStore.bannerImg ? (
              <Image
                src={currentStore.bannerImg}
                alt={currentStore.name}
                fill
                priority
                unoptimized={currentStore.bannerImg.startsWith('http')}
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center">
                <Store className="w-16 h-16 text-blue-300/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            {/* Top Right Distance & Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <span className="bg-white/95 backdrop-blur text-slate-900 font-black text-xs px-3 py-1.5 rounded-sm shadow-md">
                📍 {currentStore.distanceKm} km door ({currentStore.walkMinutes} mins walk)
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black shadow ${currentStore.badgeBg}`}
              >
                <span className="w-2 h-2 rounded-full bg-white live-indicator" />
                <span>{currentStore.statusBadge}</span>
              </span>
            </div>

            {/* Banner Bottom Information */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="bg-[#ffe500] text-[#2874f0] font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1 shadow-xs">
                  {currentStore.badgeTitle}
                </span>

                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                    {currentStore.name}
                  </h1>
                  <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <span>{currentStore.rating}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </span>
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=28.5355,77.2090&destination=${encodeURIComponent(currentStore.name + ', ' + currentStore.address)}&travelmode=walking`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                  title="Open Google Maps Walking Navigation"
                >
                  <Navigation2 className="w-4 h-4 animate-pulse" />
                  <span>Google Maps ({currentStore.distanceKm} km)</span>
                </a>

                <button
                  onClick={() => setShowChatModal(true)}
                  className="px-3.5 py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1759c9] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </button>

                <a
                  href={`tel:${currentStore.phone}`}
                  className="px-3.5 py-2.5 rounded-sm bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#2874f0]" />
                  <span>Call Store</span>
                </a>

                <a
                  href={`https://wa.me/${currentStore.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 rounded-sm bg-[#25D366] hover:bg-[#1eb855] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
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
                Valid Today
              </span>
            </div>
          )}

          {/* Vocal for Local & Digital India Trust Guarantee Strip */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-emerald-50 border-t border-orange-200/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-black text-[10px] tracking-wide uppercase shadow-xs">
                🇮🇳 Vocal for Local
              </span>
              <span className="font-extrabold text-slate-800">
                “Local Khareedo, Desh Badhao” — 100% Paisa Mohalle Ke Vyapari Ke Paas!
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-600 font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>0% Commission</span>
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <span>📲 Direct Bank UPI</span>
              </span>
              <span className="flex items-center gap-1 text-orange-700">
                <span>⚡ 5-Min Counter Pickup</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. CLICKED PRODUCT PINNED ON TOP (User Request: "product image , product deatsils , instock - available status price show thavu jote ama") */}
        {spotlightItem && (
          <div className="bg-gradient-to-r from-amber-50/90 via-white to-orange-50/90 rounded-2xl border-2 border-amber-300 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Spotlight Item (Selected & Pinned on Top)
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{spotlightItem.stockStatusText || '✓ In Stock - Available at Store Counter Now'}</span>
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                {/* Product Image */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-white border border-amber-200 overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src={spotlightItem.image}
                    alt={spotlightItem.name}
                    fill
                    className="object-cover"
                  />
                  {spotlightItem.discountPercent && (
                    <span className="absolute top-2 left-2 bg-[#fb641b] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {spotlightItem.discountPercent}% OFF
                    </span>
                  )}
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

                  {/* Specifications / Features pills */}
                  {spotlightItem.specs && spotlightItem.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {spotlightItem.specs.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] bg-amber-100/70 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold"
                        >
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price display with MRP comparison */}
                  <div className="flex items-baseline gap-2.5 pt-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ₹{spotlightItem.price}
                    </span>
                    {spotlightItem.mrp && (
                      <span className="text-sm text-slate-400 line-through">
                        MRP ₹{spotlightItem.mrp}
                      </span>
                    )}
                    {spotlightItem.discountPercent && (
                      <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Save ₹{(spotlightItem.mrp || spotlightItem.price) - spotlightItem.price} ({spotlightItem.discountPercent}% OFF)
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">
                      per {spotlightItem.unitOrDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-row md:flex-col gap-2.5 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowChatModal(true)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e65100] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire Availability (Order Karein)</span>
                </button>
                <a
                  href={`https://wa.me/${currentStore.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste, is ${spotlightItem.name} available at counter?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1eb855] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 4. IN-STORE SEARCH BAR & CATEGORY TABS (User Request: "search product on top after other all product and service show") */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Full Store Catalogue & Service Offerings
              </h2>
              <p className="text-xs text-slate-500">
                Browse all verified products with photos, counter rates, in-stock availability and specifications.
              </p>
            </div>

            {/* In-Store Search Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={inStoreSearch}
                onChange={(e) => setInStoreSearch(e.target.value)}
                placeholder="Search products, services, rates..."
                className="w-full bg-[#f8fafc] text-slate-900 text-xs pl-9 pr-4 py-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#2874f0]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Catalog Categories */}
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

          {/* Catalog Items Grid with Product Images, Details, InStock Status, and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedProductHighlight(item.name)}
                className={`rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:border-[#2874f0] bg-white ${selectedProductHighlight === item.name
                  ? 'border-amber-400 ring-2 ring-amber-300/50'
                  : 'border-slate-200'
                  }`}
              >
                <div>
                  {/* 1. PRODUCT IMAGE WITH OVERLAYS */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                    {/* Discount badge */}
                    {item.discountPercent && (
                      <span className="absolute top-2.5 left-2.5 bg-[#fb641b] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                        {item.discountPercent}% OFF
                      </span>
                    )}

                    {/* Category Tag */}
                    <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur text-slate-900 text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {item.categoryTag}
                    </span>

                    {/* Quick highlight banner if spotlighted */}
                    {selectedProductHighlight === item.name && (
                      <span className="absolute bottom-2 left-2 bg-[#ffe500] text-[#1e3a8a] text-[10px] font-black px-2 py-0.5 rounded shadow">
                        ⭐ Selected Item
                      </span>
                    )}
                  </div>

                  {/* 2. PRODUCT DETAILS & IN-STOCK STATUS */}
                  <div className="p-4 space-y-2">
                    {/* In-Stock Available Status */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{item.stockStatusText || (item.inStock ? 'In Stock - Available Now' : 'Out of Stock')}</span>
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.itemType}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h4 className="font-black text-base text-slate-900 leading-snug hover:text-[#2874f0] transition-colors">
                      {item.name}
                    </h4>

                    {/* Product Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Product Specifications */}
                    {item.specs && item.specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.specs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold"
                          >
                            ✓ {spec}
                          </span>
                        ))}
                      </div>
                    )}
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
                        {item.mrp && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-none font-bold">
                        {item.unitOrDuration}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowChatModal(true);
                      }}
                      className="px-4 py-2 bg-[#2874f0] hover:bg-[#1759c9] text-white text-xs font-black rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{item.itemType === 'service' ? 'Consult Now' : 'Order Item'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. About Business & Verified Credentials */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-3">
          <h3 className="text-base font-black text-slate-900">About {currentStore.name}</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
            {currentStore.aboutText}
          </p>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle className="w-4 h-4" /> Verified Local Merchant Account
            </span>
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <CheckCircle className="w-4 h-4" /> 0% Platform Commission Counter
            </span>
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <CheckCircle className="w-4 h-4" /> Direct Instant WhatsApp & Phone
            </span>
          </div>
        </div>
      </main>

      {/* 6. Direct 1-to-1 Live Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden">
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
                className="text-white hover:text-slate-200"
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
        </div>
      )}
    </div>
  );
}
