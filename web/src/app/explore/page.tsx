'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import InteractiveGoogleRadarMap from '@/components/InteractiveGoogleRadarMap';
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
  EyeOff
} from 'lucide-react';

interface ShowcaseProduct {
  name: string;
  price: number;
  mrp?: number;
  weight?: string;
  image?: string;
  stockStatus?: string;
}

interface MockStore {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  state: string;
  distanceKm: number;
  walkMinutes: number;
  isLiveOpen: boolean;
  statusBadge: string;
  badgeBg: string;
  phone: string;
  whatsapp: string;
  activeDeal?: string;
  rating: number;
  bannerImg: string;
  productImg: string;
  showcaseProducts: ShowcaseProduct[];
  // Relative map radar coordinates (angle in degrees & normalized radius)
  mapAngle: number;
  lat: number;
  lng: number;
}

export default function CustomerExplorePage() {
  const { signOut } = useAuth();
  const router = useRouter();

  // Mode: List View or Live Map Radar View (Top Left Red Box in user image)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Location: City & State Wise Filters (Top Filter Red Box in user image)
  const [selectedState, setSelectedState] = useState('Delhi NCR');
  const [selectedCity, setSelectedCity] = useState('New Delhi (Sector 5)');
  const [radiusKm, setRadiusKm] = useState(2.5);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected store for detail / map focus
  const [highlightedStoreId, setHighlightedStoreId] = useState<string | null>(null);

  // Reverse Enquiry Modal
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryTitle, setEnquiryTitle] = useState('');
  const [enquiryDesc, setEnquiryDesc] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  // Active Chat Modal with a store
  const [activeChatStore, setActiveChatStore] = useState<MockStore | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'store', text: 'Namaste! Fresh stock available. Counter pickup or delivery in 15 mins. What do you need?', time: 'Just now' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const states = ['Delhi NCR', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Gujarat'];
  const citiesMap: { [key: string]: string[] } = {
    'Delhi NCR': ['New Delhi (Sector 5)', 'Dwarka Sector 12', 'Connaught Place', 'Noida Sector 62', 'Gurugram Cyber Hub'],
    'Maharashtra': ['Mumbai (Andheri)', 'Mumbai (Bandra)', 'Pune (Kothrud)'],
    'Karnataka': ['Bengaluru (Koramangala)', 'Bengaluru (Indiranagar)', 'Mysuru'],
    'Uttar Pradesh': ['Lucknow (Hazratganj)', 'Kanpur (Civil Lines)', 'Varanasi'],
    'Gujarat': ['Ahmedabad (Navrangpura)', 'Surat (Vesu)', 'Vadodara'],
  };

  const categories = [
    'All',
    'Panipuri & Chaat Lari',
    'Pan Masala & Paan Parlour',
    'Mochi & Shoe Repair',
    'Hair Saloon & Grooming',
    'Chai Kitli & Nasta Point',
    'Cycle & Puncture Repair',
    'Grocery & Kirana',
    'Advocate & Legal Services',
    'CA & Tax Advisors',
    'Food, Dhabas & Restaurants',
    'Pharmacy & Medical',
    'Bakery & Dairy',
    'Electronics & Mobile'
  ];

  const stores: MockStore[] = [
    {
      id: 'store-1',
      name: 'Gupta General Store',
      category: 'Grocery & Kirana',
      address: 'Shop 14, Main Market, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.6,
      walkMinutes: 4,
      isLiveOpen: true,
      statusBadge: 'Live Open · Closes at 9:30 PM',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9876543210',
      whatsapp: '+91 9876543210',
      activeDeal: 'FLAT 15% OFF on Dal & Pulses',
      rating: 4.8,
      bannerImg: '/gupta-store.jpg',
      productImg: '/grocery-product.jpg',
      mapAngle: 45,
      lat: 28.5390,
      lng: 77.2120,
      showcaseProducts: [
        { name: 'Ashirwad Chakki Atta', price: 420, mrp: 460, weight: '10 kg', image: '/grocery-product.jpg', stockStatus: 'In Stock' },
        { name: 'Sunehri Gold Sunflower Oil', price: 650, mrp: 720, weight: '5 L', image: '/grocery-product.jpg', stockStatus: 'In Stock' },
        { name: 'Kohinoor Basmati Rice', price: 380, mrp: 440, weight: '5 kg', image: '/grocery-product.jpg', stockStatus: 'In Stock' },
      ],
    },
    {
      id: 'store-advocate',
      name: 'Sharma & Associates Advocates & Legal Advisors',
      category: 'Advocate & Legal Services',
      address: 'Chamber 204, Lawyers Complex, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.4,
      walkMinutes: 3,
      isLiveOpen: true,
      statusBadge: 'Chamber Live Open · Consultation Available',
      badgeBg: 'bg-purple-700 text-white',
      phone: '+91 9811002233',
      whatsapp: '+91 9811002233',
      activeDeal: 'Free 10-Min Preliminary Tele-Consultation',
      rating: 4.9,
      bannerImg: '/advocate-office.jpg',
      productImg: '/advocate-office.jpg',
      mapAngle: 80,
      lat: 28.5370,
      lng: 77.2110,
      showcaseProducts: [
        { name: 'Legal Consultation & Document Review', price: 500, mrp: 800, weight: '30 Mins', image: '/advocate-office.jpg', stockStatus: 'Slot Available' },
        { name: 'Property Sale Deed & Registry Verification', price: 1500, mrp: 2000, weight: 'Complete Check', image: '/advocate-office.jpg', stockStatus: 'Available' },
        { name: 'Affidavit & Rent Agreement Notary', price: 350, mrp: 500, weight: '1 Hour Delivery', image: '/advocate-office.jpg', stockStatus: 'Ready in 1h' },
      ],
    },
    {
      id: 'store-advisor',
      name: 'Aggarwal & Co. Chartered Accountants & Tax Advisors',
      category: 'CA & Tax Advisors',
      address: 'Office 203, 2nd Floor, Commercial Plaza, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.5,
      walkMinutes: 4,
      isLiveOpen: true,
      statusBadge: 'Office Live Open · Tax Advisory Available',
      badgeBg: 'bg-indigo-700 text-white',
      phone: '+91 9810012345',
      whatsapp: '+91 9810012345',
      activeDeal: 'FLAT 20% OFF on Individual ITR Filing',
      rating: 4.9,
      bannerImg: '/ca-advisor.jpg',
      productImg: '/ca-advisor.jpg',
      mapAngle: 110,
      lat: 28.5360,
      lng: 77.2140,
      showcaseProducts: [
        { name: 'Income Tax Return (ITR) Filing', price: 799, mrp: 1200, weight: 'Per AY', image: '/ca-advisor.jpg', stockStatus: 'E-File Today' },
        { name: 'GST Monthly Return Filing (GSTR-1 & 3B)', price: 1199, mrp: 1600, weight: 'Monthly Pack', image: '/ca-advisor.jpg', stockStatus: 'Available' },
        { name: 'Pvt Ltd Company Incorporation', price: 4999, mrp: 6500, weight: 'Complete Pack', image: '/ca-advisor.jpg', stockStatus: 'Fastrack' },
      ],
    },
    {
      id: 'store-food',
      name: 'Punjab Dhaba & Family Restaurant',
      category: 'Food, Dhabas & Restaurants',
      address: 'Near Metro Gate 3, Sector 5 Market',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 1.2,
      walkMinutes: 9,
      isLiveOpen: true,
      statusBadge: 'Tandoor Live Open · Hot Food Available',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9822114455',
      whatsapp: '+91 9822114455',
      activeDeal: 'FREE Butter Roti on orders above ₹300',
      rating: 4.8,
      bannerImg: '/punjab-dhaba.jpg',
      productImg: '/dhaba-thali.jpg',
      mapAngle: 260,
      lat: 28.5420,
      lng: 77.2160,
      showcaseProducts: [
        { name: 'Special Dal Makhani Handi', price: 180, mrp: 210, weight: '500 ml', image: '/dhaba-thali.jpg', stockStatus: 'Fresh Hot' },
        { name: 'Paneer Butter Masala', price: 220, mrp: 260, weight: 'Full Handi', image: '/dhaba-thali.jpg', stockStatus: 'Fresh Hot' },
        { name: 'Executive Punjabi Thali', price: 199, mrp: 250, weight: 'Complete Meal', image: '/dhaba-thali.jpg', stockStatus: 'Special Deal' },
      ],
    },
    {
      id: 'store-2',
      name: 'Apollo 24/7 Chemist & Medical',
      category: 'Pharmacy & Medical',
      address: 'Plot 3, Near Metro Gate 2',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 1.1,
      walkMinutes: 8,
      isLiveOpen: true,
      statusBadge: 'Live Open 24/7',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9811223344',
      whatsapp: '+91 9811223344',
      rating: 4.9,
      bannerImg: '/apollo-pharmacy.jpg',
      productImg: '/pharmacy-products.jpg',
      mapAngle: 140,
      lat: 28.5410,
      lng: 77.2100,
      showcaseProducts: [
        { name: 'Crocin Pain Relief 650mg', price: 32, mrp: 35, weight: '15 Tab', image: '/pharmacy-products.jpg', stockStatus: 'In Stock' },
        { name: 'Dettol Antiseptic Liquid', price: 85, mrp: 95, weight: '250 ml', image: '/pharmacy-products.jpg', stockStatus: 'In Stock' },
        { name: 'Digital Blood Pressure Monitor', price: 1850, mrp: 2250, weight: '1 Unit', image: '/pharmacy-products.jpg', stockStatus: '3yr Warranty' },
      ],
    },
    {
      id: 'store-3',
      name: 'Verma Sweet House & Fresh Dairy',
      category: 'Bakery & Dairy',
      address: 'Corner Shop, Block C Market',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 1.8,
      walkMinutes: 14,
      isLiveOpen: false,
      statusBadge: 'Closed (Shopkeeper Shutter Down)',
      badgeBg: 'bg-rose-600 text-white',
      phone: '+91 9833445566',
      whatsapp: '+91 9833445566',
      activeDeal: 'Fresh Paneer ₹320/kg till 7 PM',
      rating: 4.6,
      bannerImg: '/gupta-store.jpg',
      productImg: '/dairy-products.jpg',
      mapAngle: 220,
      lat: 28.5440,
      lng: 77.2180,
      showcaseProducts: [
        { name: 'Fresh Malai Paneer', price: 320, mrp: 360, weight: '1 kg', image: '/dairy-products.jpg', stockStatus: 'Fresh Daily' },
        { name: 'Desi Cow Ghee (Pure)', price: 680, mrp: 750, weight: '1 L', image: '/dairy-products.jpg', stockStatus: 'Pure Bilona' },
        { name: 'Full Cream Milk', price: 66, mrp: 68, weight: '1 L', image: '/dairy-products.jpg', stockStatus: 'Farm Fresh' },
      ],
    },
    {
      id: 'store-4',
      name: 'Shree Mobile World & Accessories',
      category: 'Electronics & Mobile',
      address: 'Shop 22, Central Plaza',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 2.4,
      walkMinutes: 18,
      isLiveOpen: true,
      statusBadge: 'Live Open · Closes at 9:00 PM',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9844556677',
      whatsapp: '+91 9844556677',
      rating: 4.7,
      bannerImg: '/hero-dukandar.jpg',
      productImg: '/hero-dukandar.jpg',
      mapAngle: 310,
      lat: 28.5460,
      lng: 77.2200,
      showcaseProducts: [
        { name: 'Fast Type-C Fast Charger 33W', price: 499, mrp: 799, weight: '1 pc', image: '/hero-dukandar.jpg', stockStatus: 'In Stock' },
        { name: 'TWS Wireless Earbuds', price: 899, mrp: 1499, weight: '1 pair', image: '/hero-dukandar.jpg', stockStatus: 'In Stock' },
        { name: 'Tempered Glass + Case Combo', price: 199, mrp: 350, weight: 'All Models', image: '/hero-dukandar.jpg', stockStatus: 'Ready' },
      ],
    },
    {
      id: 'store-panipuri',
      name: 'Radhe Panipuri & Live Chaat Lari',
      category: 'Panipuri & Chaat Lari',
      address: 'Near Shiv Mandir Crossroad, Sector 5 Market',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.3,
      walkMinutes: 2,
      isLiveOpen: true,
      statusBadge: 'Live Open · Cart at Crossroad',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9898112233',
      whatsapp: '+91 9898112233',
      activeDeal: 'Extra 1 Sukha Puri on Every Plate',
      rating: 4.9,
      bannerImg: '/dhaba-thali.jpg',
      productImg: '/dhaba-thali.jpg',
      mapAngle: 30,
      lat: 28.5365,
      lng: 77.2105,
      showcaseProducts: [
        { name: 'Special Golgappa Pani Puri (6 Pcs)', price: 30, mrp: 35, weight: 'Hing & Pudina Pani', image: '/dhaba-thali.jpg', stockStatus: 'Hot & Fresh' },
        { name: 'Bombay Special Sev Puri (6 Pcs)', price: 40, mrp: 50, weight: 'With Lasan Chutney', image: '/dhaba-thali.jpg', stockStatus: 'Live Made' },
        { name: 'Special Dahi Papdi Chaat', price: 50, mrp: 60, weight: 'Fresh Curd & Masala', image: '/dhaba-thali.jpg', stockStatus: 'Chef Special' },
      ],
    },
    {
      id: 'store-paan',
      name: 'Milan Paan Parlour & Cold Drinks',
      category: 'Pan Masala & Paan Parlour',
      address: 'Corner Stall 2, Near SBI Bank, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.4,
      walkMinutes: 3,
      isLiveOpen: true,
      statusBadge: 'Live Open · Closes at 11:30 PM',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9877223344',
      whatsapp: '+91 9877223344',
      activeDeal: 'Chilled Soda & Water Bottle Available',
      rating: 4.8,
      bannerImg: '/gupta-store.jpg',
      productImg: '/grocery-product.jpg',
      mapAngle: 65,
      lat: 28.5375,
      lng: 77.2098,
      showcaseProducts: [
        { name: 'Banarasi Meetha Paan (Silver Vark)', price: 25, mrp: 30, weight: 'Fresh Gulkand', image: '/grocery-product.jpg', stockStatus: 'In Stock' },
        { name: 'Calcutta Sada Khushboo Paan', price: 20, mrp: 25, weight: 'With Chaman Bahar', image: '/grocery-product.jpg', stockStatus: 'In Stock' },
        { name: 'Chilled Jeera Masala Soda', price: 15, mrp: 15, weight: '250 ml Bottle', image: '/grocery-product.jpg', stockStatus: 'Chilled' },
      ],
    },
    {
      id: 'store-mochi',
      name: 'Shree Ram Mochi & Leather Footwear Works',
      category: 'Mochi & Shoe Repair',
      address: 'Under Banyan Tree, Main Market Entry Gate',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.5,
      walkMinutes: 4,
      isLiveOpen: true,
      statusBadge: 'Live Open · On-the-Spot Work',
      badgeBg: 'bg-amber-600 text-white',
      phone: '+91 9811889900',
      whatsapp: '+91 9811889900',
      activeDeal: 'Quick Sole Paste & Machine Stitch in 10 mins',
      rating: 4.9,
      bannerImg: '/hero-dukandar.jpg',
      productImg: '/hero-dukandar.jpg',
      mapAngle: 95,
      lat: 28.5380,
      lng: 77.2085,
      showcaseProducts: [
        { name: 'Shoe Sole Double Stitching', price: 50, mrp: 70, weight: 'Both Shoes Pack', image: '/hero-dukandar.jpg', stockStatus: '10 Mins' },
        { name: 'Black / Brown Leather Polish Buffing', price: 30, mrp: 40, weight: 'Instant Shine', image: '/hero-dukandar.jpg', stockStatus: 'Available' },
        { name: 'Leather Belt Hole Punch & Buckle Repair', price: 20, mrp: 30, weight: 'Quick Service', image: '/hero-dukandar.jpg', stockStatus: 'Instant' },
      ],
    },
    {
      id: 'store-saloon',
      name: "Royal Men's Hair Saloon & Grooming",
      category: 'Hair Saloon & Grooming',
      address: 'Shop 8, First Floor, Market Complex, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.7,
      walkMinutes: 5,
      isLiveOpen: true,
      statusBadge: 'Live Open · AC Saloon',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9899334455',
      whatsapp: '+91 9899334455',
      activeDeal: 'FREE Head Massage with Haircut + Shave Combo',
      rating: 4.8,
      bannerImg: '/advocate-office.jpg',
      productImg: '/advocate-office.jpg',
      mapAngle: 160,
      lat: 28.5395,
      lng: 77.2115,
      showcaseProducts: [
        { name: "Gent's Stylish Haircut & Hairwash", price: 100, mrp: 150, weight: 'Complete Cut', image: '/advocate-office.jpg', stockStatus: 'Chair Free' },
        { name: 'Smooth Shaving & Designer Beard Trim', price: 60, mrp: 80, weight: 'With Aftershave', image: '/advocate-office.jpg', stockStatus: 'Chair Free' },
        { name: 'Navratna Herbal Oil Head Massage', price: 80, mrp: 120, weight: '15 Mins Session', image: '/advocate-office.jpg', stockStatus: 'Available' },
      ],
    },
    {
      id: 'store-chai',
      name: 'Kalyan Chai Stall & Maskabun Point',
      category: 'Chai Kitli & Nasta Point',
      address: 'Opposite Community Hall, Sector 5',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.3,
      walkMinutes: 2,
      isLiveOpen: true,
      statusBadge: 'Live Open · Hot Kadak Chai',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9866554433',
      whatsapp: '+91 9866554433',
      activeDeal: 'Kadak Masala Chai + Maskabun @ ₹40 Combo',
      rating: 4.9,
      bannerImg: '/punjab-dhaba.jpg',
      productImg: '/dhaba-thali.jpg',
      mapAngle: 185,
      lat: 28.5360,
      lng: 77.2075,
      showcaseProducts: [
        { name: 'Special Kadak Adrak Elaichi Chai', price: 12, mrp: 15, weight: 'Kulhad Cup', image: '/dhaba-thali.jpg', stockStatus: 'Fresh Hot' },
        { name: 'Amul Butter Maskabun Grilled', price: 35, mrp: 40, weight: 'Soft Fresh Bun', image: '/dhaba-thali.jpg', stockStatus: 'Ready in 2m' },
        { name: 'Crispy Punjabi Samosa with Chutney', price: 30, mrp: 35, weight: 'Plate of 2 Pcs', image: '/dhaba-thali.jpg', stockStatus: 'Fresh Fry' },
      ],
    },
    {
      id: 'store-puncture',
      name: 'Shyam Cycle & Tubeless Tyre Puncture',
      category: 'Cycle & Puncture Repair',
      address: 'Petrol Pump Road, Sector 5 Corner',
      city: 'New Delhi (Sector 5)',
      state: 'Delhi NCR',
      distanceKm: 0.8,
      walkMinutes: 6,
      isLiveOpen: true,
      statusBadge: 'Live Open · Emergency Puncture',
      badgeBg: 'bg-emerald-600 text-white',
      phone: '+91 9855443322',
      whatsapp: '+91 9855443322',
      activeDeal: 'Fast Tubeless Puncture Fix in 5 Minutes',
      rating: 4.7,
      bannerImg: '/hero-dukandar.jpg',
      productImg: '/hero-dukandar.jpg',
      mapAngle: 280,
      lat: 28.5405,
      lng: 77.2060,
      showcaseProducts: [
        { name: 'Two-Wheeler Tubeless Puncture Fix', price: 60, mrp: 80, weight: 'Per Puncture', image: '/hero-dukandar.jpg', stockStatus: 'Instant' },
        { name: 'Cycle Air Pressure & Valve Check', price: 10, mrp: 15, weight: 'Digital Gauge', image: '/hero-dukandar.jpg', stockStatus: 'Available' },
        { name: 'Heavy Duty Butyl Tube Replacement', price: 140, mrp: 180, weight: 'Standard Size', image: '/hero-dukandar.jpg', stockStatus: 'In Stock' },
      ],
    },
  ];

  const filteredStores = stores.filter((store) => {
    const matchesRadius = store.distanceKm <= radiusKm;
    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.showcaseProducts.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRadius && matchesCategory && matchesSearch;
  });

  // Nearest store finder for the "current location near shop" box
  const nearestOpenStore = [...filteredStores]
    .filter(s => s.isLiveOpen)
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] || filteredStores[0];

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryTitle.trim()) return;
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setShowEnquiryModal(false);
      setEnquiryTitle('');
      setEnquiryDesc('');
    }, 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: inputMsg, time: 'Just now' }
    ]);
    setInputMsg('');
  };

  // Live GPS Location & Destination Tracking State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 28.5355,
    lng: 77.2090
  });
  const [gpsActive, setGpsActive] = useState(true);
  const [trackingStore, setTrackingStore] = useState<MockStore | null>(null);
  const [trackingDistanceKm, setTrackingDistanceKm] = useState<number>(0.6);
  const [isSimulatingTracking, setIsSimulatingTracking] = useState<boolean>(false);

  const handleDetectLiveLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsActive(true);
        },
        (error) => {
          console.warn('Geolocation fallback:', error.message);
          setUserLocation({ lat: 28.5355, lng: 77.2090 });
          setGpsActive(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const startTrackingStore = (store: MockStore) => {
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

  const getGoogleMapsNavUrl = (store: MockStore) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = store.lat && store.lng ? `${store.lat},${store.lng}` : encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  };

  // Google Map Radar State
  const [selectedRadarStore, setSelectedRadarStore] = useState<MockStore | null>(null);

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans">
      {/* 1. Flipkart Header */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white text-[#2874f0] flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-black italic tracking-tight text-white">Dukan Bari</span>
              <span className="text-[10px] block text-[#ffe500] font-black">Near You (1-5km)</span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden sm:block relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops, items (Atta, Oil, Crocin, Milk)..."
              className="w-full bg-white text-slate-900 text-xs px-3.5 py-2 rounded-sm focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Map vs List */}
            <div className="flex bg-white/20 p-0.5 rounded-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-white text-[#2874f0] shadow-xs' : 'text-white hover:text-blue-100'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-bold rounded-xs transition-colors flex items-center gap-1 ${viewMode === 'map' ? 'bg-[#ffe500] text-[#2874f0] font-black shadow-xs' : 'text-white hover:text-blue-100'
                  }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Live Map Radar</span>
              </button>
            </div>

            <button
              onClick={() => setShowEnquiryModal(true)}
              className="bg-[#ffe500] text-[#2874f0] font-black text-xs px-3 py-1.5 rounded-sm shadow-xs flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast Enquiry</span>
            </button>

            <Link
              href="/merchant"
              className="hidden md:flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-2.5 py-1.5 rounded-sm transition-colors border border-white/20"
              title="Manage My Store, Upload Photos to Supabase, Products & Offers"
            >
              <Store className="w-3.5 h-3.5 text-[#ffe500]" />
              <span>Dukandar Studio</span>
            </Link>

            <button
              onClick={() => {
                signOut();
                router.push('/login');
              }}
              className="text-white hover:text-blue-100 text-xs font-bold px-2 py-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* 2. Top Filter Bar (Directly matching Red Boxes from User Screenshot) */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left: Distance Geofence Slider */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Sliders className="w-4 h-4 text-[#2874f0]" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Distance Geofence:</span>
            <div className="flex items-center gap-2 flex-1 sm:w-56">
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                className="w-full accent-[#2874f0]"
              />
              <span className="text-xs font-black text-[#2874f0] min-w-[50px]">{radiusKm} km</span>
            </div>
          </div>

          {/* Center Red Box: Location City & State Wise Filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1 bg-[#f1f3f6] border border-slate-300 rounded px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2874f0] flex-shrink-0" />
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">State:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity(citiesMap[e.target.value][0]);
                }}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#f1f3f6] border border-slate-300 rounded px-2.5 py-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">City/Area:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {(citiesMap[selectedState] || []).map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDetectLiveLocation}
              title="Detect Live GPS Location"
              className="p-2 bg-blue-50 hover:bg-blue-100 text-[#2874f0] rounded border border-blue-200 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live GPS</span>
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === c
                    ? 'bg-[#2874f0] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Right Red Box: "Current Location Near Shop" Indicator Bar */}
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
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs">
              <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Nearest Store
              </span>
              <span className="font-bold text-slate-900">
                {nearestOpenStore.name} is just <span className="text-emerald-700 font-black">{nearestOpenStore.distanceKm} km</span> away ({nearestOpenStore.walkMinutes} mins walk)!
              </span>
              <button
                onClick={() => startTrackingStore(nearestOpenStore)}
                className="bg-[#2874f0] hover:bg-[#1759c9] text-white px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-colors"
              >
                <Navigation2 className="w-3 h-3" />
                <span>Track Route</span>
              </button>
            </div>
          )}
        </div>

        {/* Vocal for Local & Digital India Slogan & Meaning Showcase */}
        <div className="bg-gradient-to-r from-orange-500/10 via-white to-emerald-500/10 rounded-2xl border-2 border-orange-200/80 shadow-sm p-4 sm:p-5 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Left: Artwork Image */}
            <div className="relative w-full md:w-56 h-40 rounded-xl overflow-hidden shadow-md flex-shrink-0 border-2 border-white bg-slate-100">
              <Image
                src="/vocal-for-local.jpg"
                alt="Vocal for Local Digital India"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-black">
                <span className="bg-orange-600 px-1.5 py-0.5 rounded shadow">🇮🇳 Vocal for Local</span>
                <span className="bg-emerald-700 px-1.5 py-0.5 rounded shadow">Digital India</span>
              </div>
            </div>

            {/* Center / Right: Slogans & Meaning */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                  🇮🇳 Rashtriya Swabhiman
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ⚡ 0% Platform Commission
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  📲 Direct Bank UPI
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  <span className="text-orange-600">“Local Khareedo, Desh Badhao”</span> — Har Rupiya Apne Mohalle Me!
                </h3>
                <p className="text-xs font-bold text-slate-700 italic">
                  “Digital Bharat, Samriddh Bharat — Har Dukaan Digital, Har Vyapari Sashakt!”
                </p>
              </div>

              {/* Meaning & Impact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-left text-xs">
                <div className="bg-white/90 p-3 rounded-lg border border-orange-100 shadow-2xs">
                  <div className="font-extrabold text-orange-900 flex items-center gap-1.5 mb-1">
                    <Heart className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                    <span>Vocal for Local Ka Asli Arth (Meaning):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Jab aap mohalle ki dukan, chaat lari, ya saloon se khareedte hain, toh aapka paisa MNC aggregators ko 30% commission me nahi balki seedha aapke padosi dukandar aur uske parivar ke paas rehta hai.
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-emerald-100 shadow-2xs">
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Digital India Ka Sashaktikaran (Impact):</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Chhoti se chhoti chaat lari, mochi aur kirana bhi bina kisi intermediary fees ke live Google Map radar pe 1-tap me online aate hain, aur direct UPI dwara turant bhugtan prapt karte hain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Top Left Red Box: "LIVE MAP TO SHOW SHOPE LIVE TRACK" (Interactive Google Map with Radar) */}
        {viewMode === 'map' && (
          <InteractiveGoogleRadarMap
            userLocation={userLocation}
            stores={filteredStores as any}
            radiusKm={radiusKm}
            selectedStore={selectedRadarStore as any}
            onSelectStore={(store) => {
              setSelectedRadarStore(store as any);
              if (store) setHighlightedStoreId(store.id);
            }}
            onTrackStore={(store) => startTrackingStore(store as any)}
            onChatStore={(store) => setActiveChatStore(store as any)}
            onSwitchToList={() => setViewMode('list')}
          />
        )}


        {/* 5. STORE CARDS: WITH PRODUCT PHOTO + BANNER IMG IN SHOP PHOTO (Matching Store Card Red Box) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-900">
              Nearby Physical Stores ({filteredStores.length} shops open within {radiusKm} km)
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Live updates via Socket.io
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-xl shadow-xs border transition-all overflow-hidden flex flex-col justify-between ${highlightedStoreId === store.id ? 'border-[#2874f0] ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-[#2874f0]'
                  }`}
              >
                <div>
                  {/* Store Front Banner Image + Distance Badge (Clickable to open store banner top) */}
                  <Link href={`/store/${store.id}`} className="block relative h-44 w-full bg-slate-900 overflow-hidden group">
                    <Image
                      src={store.bannerImg}
                      alt={store.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Distance Badge */}
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-slate-900 font-black text-xs px-2.5 py-1 rounded shadow-md">
                      {store.distanceKm} km door
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
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#ffe500] drop-shadow-xs block">
                          {store.category}
                        </span>
                        <p className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5 drop-shadow-xs">
                          <MapPin className="w-3 h-3 text-[#ffe500]" />
                          <span>{store.address}</span>
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Red Box Feature: "PRODUCT PHOTO" & SHOWCASE PRODUCTS INSET (Click to open pinned product) */}
                  <div className="p-4 bg-[#f8fafc] border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-[#2874f0]" />
                        <span>Available Products & Services (Click item to spotlight)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        In Stock Now
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail Photo - Clickable */}
                      <Link
                        href={`/store/${store.id}?product=${encodeURIComponent(store.showcaseProducts[0]?.name || '')}`}
                        className="relative w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 shadow-xs hover:border-[#2874f0] transition-colors"
                        title="Click to view product in store"
                      >
                        <Image
                          src={store.productImg}
                          alt="Showcase Product"
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Product items clickable list with images, details, in-stock status and price */}
                      <div className="flex-1 space-y-2">
                        {store.showcaseProducts.map((p, idx) => (
                          <Link
                            key={idx}
                            href={`/store/${store.id}?product=${encodeURIComponent(p.name)}`}
                            className="flex items-center justify-between text-xs bg-white hover:bg-blue-50/70 p-2 rounded-lg border border-slate-200/80 transition-all shadow-2xs group/item"
                            title={`Click to view ${p.name} on store banner`}
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

                                {/* In-Stock Available status */}
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-bold text-emerald-700">
                                    {p.stockStatus || 'In Stock - Available'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price with MRP */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <div className="flex items-baseline gap-1">
                                  <span className="font-black text-slate-900 group-hover/item:text-[#2874f0] text-xs">
                                    ₹{p.price}
                                  </span>
                                  {p.mrp && (
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
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges & Active Deals */}
                  <div className="p-4 pt-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold ${store.badgeBg}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${store.isLiveOpen ? 'bg-white live-indicator' : 'bg-slate-300'
                            }`}
                        />
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
                    className="w-full py-2 px-3 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-300 shadow-2xs"
                  >
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>🗺️ Live Google Maps Navigation & Tracking ({store.distanceKm} km)</span>
                  </button>

                  <Link
                    href={`/store/${store.id}`}
                    className="w-full py-2 px-3 rounded bg-blue-50 hover:bg-blue-100 text-[#2874f0] font-black text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-200 shadow-2xs"
                  >
                    <span>Open Store Banner & Full Catalog (All Items)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveChatStore(store)}
                      className="flex-1 py-2 px-3 rounded bg-[#2874f0] hover:bg-[#1759c9] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Direct Live Chat (Poochhein)</span>
                    </button>

                    <a
                      href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
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
        </div>
      </main>

      {/* Reverse Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEnquiryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#2874f0]" />
              <h3 className="text-lg font-black text-slate-900">Broadcast Reverse-Enquiry</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Post an item name. All physical shops within your {radiusKm} km radius will be alerted immediately!
            </p>

            <form onSubmit={handleSendEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Item Name / What do you need?
                </label>
                <input
                  type="text"
                  required
                  value={enquiryTitle}
                  onChange={(e) => setEnquiryTitle(e.target.value)}
                  placeholder="e.g. Fortune Sunflower Oil 5L or Crocin 650mg"
                  className="w-full px-3.5 py-2.5 rounded border border-slate-300 text-xs focus:outline-none focus:border-[#2874f0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Brand / Urgency Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={enquiryDesc}
                  onChange={(e) => setEnquiryDesc(e.target.value)}
                  placeholder="Need 2 packs urgent counter pickup in 15 mins..."
                  className="w-full px-3.5 py-2 rounded border border-slate-300 text-xs focus:outline-none focus:border-[#2874f0]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded bg-[#fb641b] hover:bg-[#e65100] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Blast to All {radiusKm}km Shops (Sabhi Dukano Ko Bhejein)</span>
              </button>

              {enquirySent && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enquiry dispatched! Nearby shopkeepers are receiving alerts on their desk radar.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 1-to-1 Live Chat Modal */}
      {activeChatStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask rate, counter pickup, delivery..."
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

      {/* Google Maps Live Destination & GPS Tracking Modal */}
      {trackingStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setTrackingStore(null);
                setIsSimulatingTracking(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
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

            {/* Live Distance & ETA Metrics */}
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
                  {trackingDistanceKm <= 0.05 ? '100% Reached' : `${Math.round(((trackingStore.distanceKm - trackingDistanceKm) / trackingStore.distanceKm) * 100) || 10}% En Route`}
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
                    width: `${Math.min(100, Math.max(10, Math.round(((trackingStore.distanceKm - trackingDistanceKm) / trackingStore.distanceKm) * 100)))}%`
                  }}
                />
              </div>

              {/* Simulate Tracking Buttons */}
              <div className="mt-2.5 flex items-center justify-between">
                <button
                  onClick={handleSimulateWalk}
                  disabled={isSimulatingTracking || trackingDistanceKm <= 0.05}
                  className={`px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                    trackingDistanceKm <= 0.05
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : isSimulatingTracking
                      ? 'bg-blue-100 text-blue-700 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{trackingDistanceKm <= 0.05 ? 'You Have Arrived! 🎉' : isSimulatingTracking ? 'Tracking Live Walk...' : '🚶 Simulate Walking Step Closer'}</span>
                </button>

                <button
                  onClick={() => setTrackingDistanceKm(trackingStore.distanceKm)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline font-semibold"
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

            {/* Turn-by-Turn Guidance Steps */}
            <div className="space-y-2 mb-5">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Turn-by-Turn Walking Instructions:
              </span>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2874f0] font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="font-bold text-slate-900">Head towards Sector 5 Main Market Avenue</p>
                    <p className="text-[11px] text-slate-500">Walk straight for 150 meters towards the main road crossing.</p>
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2874f0] font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="font-bold text-slate-900">Take pedestrian crossing past the landmark</p>
                    <p className="text-[11px] text-slate-500">Continue for ~{(trackingDistanceKm * 500).toFixed(0)}m. Follow storefront signboards.</p>
                  </div>
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="font-bold text-emerald-900">Arrive at {trackingStore.name}</p>
                    <p className="text-[11px] text-emerald-700">{trackingStore.address} — Ready for counter pickup or direct purchase!</p>
                  </div>
                </div>
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
                  setActiveChatStore(trackingStore);
                  setTrackingStore(null);
                }}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
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
