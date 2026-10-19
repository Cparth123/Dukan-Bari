import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface ShowcaseProduct {
  name: string;
  price: number;
  weight?: string;
}

interface CatalogItem {
  name: string;
  price: number;
  mrp?: number;
  unit?: string;
  type: 'product' | 'service';
  desc: string;
  stockStatus?: string;
}

interface StoreItem {
  id: string;
  name: string;
  category: string;
  badgeTitle: string;
  address: string;
  distance: number;
  walkMinutes: number;
  isOpen: boolean;
  statusBadge: string;
  activeDeal?: string;
  phone: string;
  rating: number;
  bannerColor: string;
  showcaseProducts: ShowcaseProduct[];
  catalog: CatalogItem[];
}

export default function CustomerHomeScreen() {
  const { signOut } = useAuth();

  // View Mode: 'list' | 'map' (Top Left Red Box in user image)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Location: City, State Wise Filters (Top Center Red Box in user image)
  const [selectedState, setSelectedState] = useState('Delhi NCR');
  const [selectedCity, setSelectedCity] = useState('New Delhi (Sector 5)');
  const [radiusKm, setRadiusKm] = useState(2.5);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Selected Store Detail Modal (User feature: click product -> open store banner top, pinned product, in-store search, other products/services)
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [pinnedProduct, setPinnedProduct] = useState<CatalogItem | null>(null);
  const [inStoreSearch, setInStoreSearch] = useState('');

  // Reverse Enquiry Modal
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryTitle, setEnquiryTitle] = useState('');
  const [enquiryDesc, setEnquiryDesc] = useState('');

  // 1-to-1 Chat Modal
  const [activeChatStore, setActiveChatStore] = useState<StoreItem | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'store', text: 'Namaste! Live counter pickup & delivery available in 15 mins. What do you need?' },
  ]);

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
    'Electronics'
  ];

  const stores: StoreItem[] = [
    {
      id: '1',
      name: 'Gupta General Store',
      category: 'Grocery & Kirana',
      badgeTitle: 'Local Kirana Dukaan',
      address: 'Shop 14, Main Market, Sector 5',
      distance: 0.6,
      walkMinutes: 4,
      isOpen: true,
      statusBadge: 'Live Open · Closes at 9:30 PM',
      activeDeal: 'FLAT 15% OFF on Dal',
      phone: '+91 9876543210',
      rating: 4.8,
      bannerColor: '#1e3a8a',
      showcaseProducts: [
        { name: 'Ashirwad Chakki Atta (10kg)', price: 420 },
        { name: 'Sunflower Oil (5L)', price: 650 },
        { name: 'Kohinoor Basmati Rice (5kg)', price: 380 },
      ],
      catalog: [
        { name: 'Ashirwad Chakki Atta', price: 420, unit: '10 kg Pack', type: 'product', desc: '100% stone ground whole wheat flour' },
        { name: 'Sunehri Gold Sunflower Oil', price: 650, unit: '5 Litre Can', type: 'product', desc: 'Refined heart friendly cooking oil' },
        { name: 'Kohinoor Basmati Rice Extra Long', price: 380, unit: '5 kg Bag', type: 'product', desc: 'Aged fragrant biryani basmati rice' },
        { name: 'Tata Salt Vacuum Evaporated', price: 28, unit: '1 kg Pack', type: 'product', desc: 'Iodized table salt with purity seal' },
        { name: 'MDH Deggi Mirch & Garam Masala', price: 95, unit: '100g Box', type: 'product', desc: 'Rich red color and aromatic spices' },
      ],
    },
    {
      id: 'store-advocate',
      name: 'Sharma & Associates Advocates',
      category: 'Advocate & Legal Services',
      badgeTitle: 'High Court & District Chamber',
      address: 'Chamber 204, Lawyers Complex, Sector 5',
      distance: 0.4,
      walkMinutes: 3,
      isOpen: true,
      statusBadge: 'Chamber Live Open · Consultation Available',
      activeDeal: 'Free 10-Min Tele-Consultation',
      phone: '+91 9811002233',
      rating: 4.9,
      bannerColor: '#581c87',
      showcaseProducts: [
        { name: 'Legal Consultation & Review', price: 500 },
        { name: 'Property Registry Title Check', price: 1500 },
        { name: 'Affidavit & Rent Agreement', price: 350 },
      ],
      catalog: [
        { name: 'Legal Consultation & Document Review', price: 500, unit: '30 Mins Session', type: 'service', desc: '1-to-1 chamber consultation on property, civil dispute or business contracts' },
        { name: 'Property Sale Deed & Registry Verification', price: 1500, unit: 'Complete Title Search', type: 'service', desc: 'Verification of 30-year land records and registry authenticity' },
        { name: 'Affidavit, Rent Agreement & Notary', price: 350, unit: '1 Hour Delivery', type: 'service', desc: 'Stamp paper notarized rental agreement, affidavits' },
        { name: 'Consumer Court & Legal Notice Drafting', price: 1200, unit: 'Official Notice Pack', type: 'service', desc: 'Formal legal notices under Section 138 cheque bounce or unpaid dues' },
      ],
    },
    {
      id: 'store-advisor',
      name: 'Aggarwal & Co. Chartered Accountants',
      category: 'CA & Tax Advisors',
      badgeTitle: 'ICAI Registered CA Firm',
      address: 'Office 203, Commercial Plaza, Sector 5',
      distance: 0.5,
      walkMinutes: 4,
      isOpen: true,
      statusBadge: 'Office Live Open · Tax Advisory Available',
      activeDeal: 'FLAT 20% OFF on Individual ITR',
      phone: '+91 9810012345',
      rating: 4.9,
      bannerColor: '#312e81',
      showcaseProducts: [
        { name: 'Income Tax Return (ITR) Filing', price: 799 },
        { name: 'GST Monthly Return (GSTR 1 & 3B)', price: 1199 },
        { name: 'Pvt Ltd Company Incorporation', price: 4999 },
      ],
      catalog: [
        { name: 'Income Tax Return (ITR) Filing', price: 799, unit: 'Per AY', type: 'service', desc: 'Complete calculation, tax optimization, deductions check, and instant e-filing' },
        { name: 'GST Monthly Return Filing (GSTR-1 & 3B)', price: 1199, unit: 'Monthly Package', type: 'service', desc: 'Sales and 2B input tax credit reconciliation and filing' },
        { name: 'Pvt Ltd Company Incorporation', price: 4999, unit: 'All Inclusive Pack', type: 'service', desc: 'Name approval, DSC, DIN, MOA/AOA drafting, PAN & TAN' },
        { name: 'Financial Advisory & MSME Loan Project Report', price: 2500, unit: 'CMA Data Report', type: 'service', desc: '5-year balance sheet projections for MSME bank credit limits' },
      ],
    },
    {
      id: 'store-food',
      name: 'Punjab Dhaba & Family Restaurant',
      category: 'Food, Dhabas & Restaurants',
      badgeTitle: 'Authentic Tandoor & Thali',
      address: 'Near Metro Gate 3, Sector 5 Market',
      distance: 1.2,
      walkMinutes: 9,
      isOpen: true,
      statusBadge: 'Tandoor Live Open · Hot Food Available',
      activeDeal: 'FREE Butter Roti on orders > ₹300',
      phone: '+91 9822114455',
      rating: 4.8,
      bannerColor: '#831843',
      showcaseProducts: [
        { name: 'Special Dal Makhani Handi', price: 180 },
        { name: 'Paneer Butter Masala', price: 220 },
        { name: 'Executive Punjabi Thali', price: 199 },
      ],
      catalog: [
        { name: 'Special Dal Makhani Handi', price: 180, unit: 'Full Handi (500ml)', type: 'product', desc: 'Slow cooked black lentils simmered with white butter and cream' },
        { name: 'Paneer Butter Masala', price: 220, unit: 'Full Handi', type: 'product', desc: 'Fresh malai paneer cubes in velvety tomato cashew gravy' },
        { name: 'Butter Tandoori Roti', price: 15, unit: '1 pc', type: 'product', desc: 'Crisp charcoal tandoor baked roti with pure desi butter' },
        { name: 'Executive Punjabi Thali', price: 199, unit: 'Complete Meal Pack', type: 'product', desc: 'Dal Makhani + Shahi Paneer + Rice + 4 Rotis + Raita + Sweet' },
      ],
    },
    {
      id: '2',
      name: 'Apollo 24/7 Chemist & Medical',
      category: 'Pharmacy & Medical',
      badgeTitle: 'Licensed Medical Store',
      address: 'Plot 3, Near Metro Gate 2',
      distance: 1.1,
      walkMinutes: 8,
      isOpen: true,
      statusBadge: 'Live Open 24/7',
      phone: '+91 9811223344',
      rating: 4.9,
      bannerColor: '#065f46',
      showcaseProducts: [
        { name: 'Crocin 650mg (15 Tab)', price: 32 },
        { name: 'Dettol Liquid (250ml)', price: 85 },
      ],
      catalog: [
        { name: 'Crocin Pain Relief 650mg', price: 32, unit: '15 Tablets', type: 'product', desc: 'Fast acting paracetamol for fever and headache relief' },
        { name: 'Dettol Antiseptic Liquid', price: 85, unit: '250 ml', type: 'product', desc: 'Antiseptic disinfectant for cuts and personal hygiene' },
        { name: 'Digital Blood Pressure Monitor', price: 1850, unit: '1 Device with Warranty', type: 'product', desc: 'Accurate clinical grade automatic digital BP monitor' },
      ],
    },
    {
      id: '3',
      name: 'Verma Sweet House & Dairy',
      category: 'Bakery & Dairy',
      badgeTitle: 'Fresh Dairy & Sweets',
      address: 'Corner Shop, Block C',
      distance: 1.8,
      walkMinutes: 14,
      isOpen: false,
      statusBadge: 'Closed (Shutter Down)',
      activeDeal: 'Fresh Paneer ₹320/kg',
      phone: '+91 9833445566',
      rating: 4.6,
      bannerColor: '#78350f',
      showcaseProducts: [
        { name: 'Fresh Malai Paneer (1kg)', price: 320 },
        { name: 'Full Cream Milk (1L)', price: 66 },
      ],
      catalog: [
        { name: 'Fresh Malai Paneer', price: 320, unit: '1 kg', type: 'product', desc: 'Daily soft malai cottage cheese' },
        { name: 'Desi Cow Ghee (Pure)', price: 680, unit: '1 Litre', type: 'product', desc: 'Traditional bilona pure desi cow ghee' },
        { name: 'Full Cream Fresh Milk', price: 66, unit: '1 Litre', type: 'product', desc: 'Fresh pasteurized farm milk' },
      ],
    },
    {
      id: '4',
      name: 'Shree Mobile World',
      category: 'Electronics',
      badgeTitle: 'Mobile Accessories Hub',
      address: 'Central Plaza',
      distance: 2.4,
      walkMinutes: 18,
      isOpen: true,
      statusBadge: 'Live Open · Closes at 9 PM',
      phone: '+91 9844556677',
      rating: 4.7,
      bannerColor: '#0f172a',
      showcaseProducts: [
        { name: 'Fast Type-C Charger 33W', price: 499 },
        { name: 'TWS Wireless Earbuds', price: 899 },
      ],
      catalog: [
        { name: 'Fast Type-C Charger 33W', price: 499, unit: '1 pc', type: 'product', desc: 'Super VOOC & PD quick charging adapter' },
        { name: 'TWS Wireless Earbuds', price: 899, unit: '1 Pair', type: 'product', desc: 'Bass boost Bluetooth 5.3 earbuds with 30hr battery' },
        { name: 'Tempered Glass + Shockproof Case', price: 199, unit: 'Combo Pack', type: 'product', desc: '9H hardness scratch resistant screen protector' },
      ],
    },
  ];

  const filteredStores = stores.filter((s) => {
    const matchesRadius = s.distance <= radiusKm;
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesRadius && matchesCategory;
  });

  const nearestStore = [...filteredStores].sort((a, b) => a.distance - b.distance)[0] || filteredStores[0];

  const handleOpenStoreWithProduct = (store: StoreItem, productName?: string) => {
    setSelectedStore(store);
    if (productName) {
      const match = store.catalog.find((c) => c.name.toLowerCase().includes(productName.toLowerCase()));
      setPinnedProduct(match || store.catalog[0]);
    } else {
      setPinnedProduct(store.catalog[0] || null);
    }
  };

  const handleSendEnquiry = () => {
    if (!enquiryTitle.trim()) return;
    Alert.alert(
      'Enquiry Broadcasted!',
      `Your request "${enquiryTitle}" has been sent to all verified stores within ${radiusKm} km. Merchants will quote rates directly on your app!`
    );
    setShowEnquiryModal(false);
    setEnquiryTitle('');
    setEnquiryDesc('');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Flipkart Blue Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>Dukan Bari Plus</Text>
          <Text style={styles.brandSub}>Hyperlocal Stores within 1-5 km</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleActive]}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          >
            <Text style={styles.viewToggleText}>{viewMode === 'list' ? '🗺️ Live Map' : '📋 List'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Floating Broadcast Enquiry Banner */}
        <TouchableOpacity
          style={styles.broadcastBanner}
          onPress={() => setShowEnquiryModal(true)}
        >
          <View>
            <Text style={styles.broadcastBannerTitle}>✨ Broadcast Reverse-Enquiry</Text>
            <Text style={styles.broadcastBannerSub}>
              Query all nearby shops for an item at once!
            </Text>
          </View>
          <Text style={styles.broadcastArrow}>→</Text>
        </TouchableOpacity>

        {/* Location City & State Filter Row (Top Center Red Box) */}
        <View style={styles.locationFilterCard}>
          <View style={styles.locHeaderRow}>
            <Text style={styles.locTitle}>📍 {selectedCity}, {selectedState}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Location Changed', 'Using Live GPS: Sector 5, New Delhi')}>
              <Text style={styles.locChangeText}>Change City/GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Current Location Near Shop Indicator (Top Right Red Box) */}
          {nearestStore && (
            <View style={styles.nearestBadge}>
              <Text style={styles.nearestText}>
                🏪 Nearest Shop: <Text style={{ fontWeight: '900', color: '#16a34a' }}>{nearestStore.name}</Text> is just {nearestStore.distance} km away ({nearestStore.walkMinutes} mins walk)!
              </Text>
            </View>
          )}

          {/* Distance Slider / Geofence Pills */}
          <View style={styles.radiusRow}>
            <Text style={styles.filterLabel}>Radius Geofence: {radiusKm} km</Text>
            <View style={styles.radiusPills}>
              {[1, 2, 2.5, 3, 5].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[styles.radiusBtn, radiusKm === km && styles.radiusBtnActive]}
                  onPress={() => setRadiusKm(km)}
                >
                  <Text style={[styles.radiusBtnText, radiusKm === km && styles.radiusBtnTextActive]}>
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}
                onPress={() => setSelectedCategory(c)}
              >
                <Text style={[styles.catBtnText, selectedCategory === c && styles.catBtnTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LIVE MAP TRACK VIEW (Top Left Red Box in user image) */}
        {viewMode === 'map' && (
          <View style={styles.radarCard}>
            <Text style={styles.radarTitle}>Live Store Tracking Radar</Text>
            <Text style={styles.radarSub}>Tap any store pin to open direct live chat</Text>

            <View style={styles.radarScreen}>
              <View style={[styles.radarRing, { width: 80, height: 80 }]} />
              <View style={[styles.radarRing, { width: 160, height: 160 }]} />
              <View style={[styles.radarRing, { width: 240, height: 240 }]} />

              {/* Center User Pin */}
              <View style={styles.centerPin}>
                <View style={styles.userDot} />
                <Text style={styles.userPinText}>You (GPS)</Text>
              </View>

              {/* Store Pins */}
              {filteredStores.map((s, idx) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.storePin,
                    {
                      top: 50 + (idx === 0 ? -40 : idx === 1 ? 35 : idx === 2 ? -60 : 50),
                      left: 120 + (idx === 0 ? 30 : idx === 1 ? -60 : idx === 2 ? -50 : 60),
                    },
                  ]}
                  onPress={() => setActiveChatStore(s)}
                >
                  <View style={[styles.pinDot, s.isOpen ? styles.pinOpen : styles.pinClosed]} />
                  <Text style={styles.pinLabel}>{s.name} ({s.distance}km)</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Vocal for Local & Digital India Card */}
        <View style={styles.vocalCard}>
          <View style={styles.vocalBadgeRow}>
            <Text style={styles.vocalBadgeFlag}>🇮🇳 VOCAL FOR LOCAL</Text>
            <Text style={styles.digitalIndiaBadge}>DIGITAL INDIA · 0% FEE</Text>
          </View>
          <Text style={styles.vocalTitle}>“Local Khareedo, Desh Badhao”</Text>
          <Text style={styles.vocalSlogan}>Har Rupiya Apne Mohalle Me — Direct UPI to Dukandar</Text>
          <View style={styles.vocalMeaningBox}>
            <Text style={styles.vocalMeaningText}>
              • Vocal for Local Meaning: Shopping from nearby kiranas, chai stalls, chaat lari, cobblers & local pros keeps 100% money in the community with 0% corporate cut.
            </Text>
            <Text style={styles.vocalMeaningText}>
              • Digital India: Live Google Maps destination tracking & instant direct UPI payments empowering every physical vendor in Bharat.
            </Text>
          </View>
        </View>

        {/* STORE CARDS: WITH PRODUCT PHOTO & BANNER PHOTO (Matching Store Card Red Box) */}
        <Text style={styles.resultsCount}>
          Nearby Physical Stores ({filteredStores.length} open within {radiusKm} km)
        </Text>

        {filteredStores.map((store) => (
          <View key={store.id} style={styles.storeCard}>
            {/* Header info (Clickable to open Store Banner) */}
            <TouchableOpacity
              onPress={() => handleOpenStoreWithProduct(store)}
              style={styles.storeHeader}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.ratingBadge}>★ {store.rating}</Text>
                </View>
                <Text style={styles.storeCategory}>{store.category}</Text>
                <Text style={styles.storeAddress}>📍 {store.address}</Text>
              </View>
              <Text style={styles.distanceBadge}>{store.distance} km door</Text>
            </TouchableOpacity>

            {/* PRODUCT PHOTO & SHOWCASE ITEMS INSET (Click to spotlight pinned product) */}
            <View style={styles.productsInset}>
              <View style={styles.productSectionHeader}>
                <Text style={styles.productSectionTitle}>📦 Counter Products & Services</Text>
                <Text style={styles.tapToOpenHint}>Tap item to spotlight ↓</Text>
              </View>

              {store.showcaseProducts.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.productRowClickable}
                  onPress={() => handleOpenStoreWithProduct(store, p.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.productName}>• {p.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{p.price}</Text>
                    <Text style={styles.viewArrow}>View →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Badge */}
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, store.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                <View style={[styles.badgeDot, store.isOpen ? styles.dotOpen : styles.dotClosed]} />
                <Text style={[styles.badgeText, store.isOpen ? styles.textOpen : styles.textClosed]}>
                  {store.statusBadge}
                </Text>
              </View>

              {store.activeDeal && (
                <View style={styles.dealBadge}>
                  <Text style={styles.dealText}>🏷️ {store.activeDeal}</Text>
                </View>
              )}
            </View>

            {/* Live Google Maps Directions Button */}
            <TouchableOpacity
              style={styles.mapNavBtn}
              onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.name + ', ' + store.address)}`)}
            >
              <Text style={styles.mapNavBtnText}>🗺️ Live Google Maps Directions ({store.distance} km)</Text>
            </TouchableOpacity>

            {/* Direct Open Store Banner & Full Catalog Button */}
            <TouchableOpacity
              style={styles.openStoreBtn}
              onPress={() => handleOpenStoreWithProduct(store)}
            >
              <Text style={styles.openStoreBtnText}>🏪 Open Store Banner & Full Catalog →</Text>
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => setActiveChatStore(store)}
              >
                <Text style={styles.chatBtnText}>💬 Direct Live Chat (Poochhein)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Reverse Enquiry Modal */}
      <Modal visible={showEnquiryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Broadcast Reverse-Enquiry</Text>
            <Text style={styles.modalSub}>
              Query all nearby shops ({radiusKm} km) at once!
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Item name (e.g. Fortune Sunflower Oil 5L or Crocin)"
              placeholderTextColor="#94a3b8"
              value={enquiryTitle}
              onChangeText={setEnquiryTitle}
            />

            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Brand / Quantity notes..."
              placeholderTextColor="#94a3b8"
              value={enquiryDesc}
              onChangeText={setEnquiryDesc}
              multiline
            />

            <TouchableOpacity style={styles.sendEnqBtn} onPress={handleSendEnquiry}>
              <Text style={styles.sendEnqBtnText}>Blast to Nearby Stores</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowEnquiryModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 1-to-1 Live Chat Modal */}
      <Modal visible={!!activeChatStore} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.chatModalHeader}>
              <Text style={styles.chatModalTitle}>{activeChatStore?.name}</Text>
              <Text style={styles.liveIndicator}>🟢 Socket Live</Text>
            </View>

            <ScrollView style={styles.chatBody}>
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.msgBubble,
                    m.sender === 'user' ? styles.userBubble : styles.storeBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      m.sender === 'user' ? styles.userMsgText : styles.storeMsgText,
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Ask about rate, delivery..."
                placeholderTextColor="#94a3b8"
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.sendMsgBtn} onPress={handleSendMessage}>
                <Text style={styles.sendMsgBtnText}>Send</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeChatBtn}
              onPress={() => setActiveChatStore(null)}
            >
              <Text style={styles.closeChatText}>Close Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. STORE BANNER & PINNED PRODUCT FULL MODAL */}
      <Modal visible={!!selectedStore} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f3f6' }}>
          {selectedStore && (
            <View style={{ flex: 1 }}>
              {/* Top Flipkart Blue Navigation Bar */}
              <View style={styles.storeDetailTopBar}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStore(null);
                    setPinnedProduct(null);
                    setInStoreSearch('');
                  }}
                  style={styles.backBtn}
                >
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.storeDetailNavTitle} numberOfLines={1}>
                  {selectedStore.name}
                </Text>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {/* Store Banner on Top (User feature: "open shopper store banner top") */}
                <View style={[styles.storeDetailBanner, { backgroundColor: selectedStore.bannerColor }]}>
                  <View style={styles.bannerBadgeRow}>
                    <Text style={styles.bannerBadgeTitle}>{selectedStore.badgeTitle}</Text>
                    <Text style={styles.bannerDistanceBadge}>📍 {selectedStore.distance} km door</Text>
                  </View>
                  <Text style={styles.bannerStoreName}>{selectedStore.name}</Text>
                  <Text style={styles.bannerCategoryText}>{selectedStore.category}</Text>
                  <Text style={styles.bannerAddressText}>📍 {selectedStore.address}</Text>

                  <View style={styles.bannerRatingRow}>
                    <Text style={styles.bannerRating}>★ {selectedStore.rating} (Verified)</Text>
                    <Text style={styles.bannerStatus}>{selectedStore.statusBadge}</Text>
                  </View>

                  <View style={styles.bannerActionRow}>
                    <TouchableOpacity
                      style={styles.bannerChatBtn}
                      onPress={() => {
                        const s = selectedStore;
                        setSelectedStore(null);
                        setActiveChatStore(s);
                      }}
                    >
                      <Text style={styles.bannerChatBtnText}>💬 Live Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bannerCallBtn}
                      onPress={() => Alert.alert('Calling Merchant', `Calling ${selectedStore.phone}`)}
                    >
                      <Text style={styles.bannerCallBtnText}>📞 Call {selectedStore.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* PINNED PRODUCT ON TOP (User feature: "in search product on top after other all product and service show") */}
                {pinnedProduct && (
                  <View style={styles.pinnedProductCard}>
                    <View style={styles.pinnedHeaderRow}>
                      <Text style={styles.pinnedTag}>⭐ SPOTLIGHT / CLICKED ITEM</Text>
                      <Text style={styles.pinnedInStock}>Ready at Counter</Text>
                    </View>
                    <Text style={styles.pinnedProductName}>{pinnedProduct.name}</Text>
                    <Text style={styles.pinnedProductDesc}>{pinnedProduct.desc}</Text>

                    <View style={styles.pinnedPriceRow}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                          <Text style={styles.pinnedPrice}>₹{pinnedProduct.price}</Text>
                          {pinnedProduct.mrp && (
                            <Text style={{ fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' }}>
                              ₹{pinnedProduct.mrp}
                            </Text>
                          )}
                        </View>
                        {pinnedProduct.unit && (
                          <Text style={styles.pinnedUnit}>{pinnedProduct.unit}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.pinnedReserveBtn}
                        onPress={() => {
                          const s = selectedStore;
                          const prod = pinnedProduct;
                          setSelectedStore(null);
                          setActiveChatStore(s);
                          setChatInput(`Hi, is ${prod.name} available right now at counter?`);
                        }}
                      >
                        <Text style={styles.pinnedReserveBtnText}>Ask / Reserve Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* In-Store Search Bar */}
                <View style={styles.inStoreSearchContainer}>
                  <Text style={styles.inStoreSearchLabel}>Search Inside Store Catalog:</Text>
                  <TextInput
                    style={styles.inStoreSearchInput}
                    placeholder="Search products or services..."
                    placeholderTextColor="#94a3b8"
                    value={inStoreSearch}
                    onChangeText={setInStoreSearch}
                  />
                </View>

                {/* All Other Products & Services List */}
                <View style={styles.catalogSection}>
                  <Text style={styles.catalogSectionTitle}>
                    All Available Products & Services ({selectedStore.catalog.length} items)
                  </Text>

                  {selectedStore.catalog
                    .filter((item) =>
                      item.name.toLowerCase().includes(inStoreSearch.toLowerCase()) ||
                      item.desc.toLowerCase().includes(inStoreSearch.toLowerCase())
                    )
                    .map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.catalogItemRow,
                          pinnedProduct?.name === item.name && styles.catalogItemRowActive,
                        ]}
                        onPress={() => setPinnedProduct(item)}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.catalogItemName}>{item.name}</Text>
                            <Text
                              style={[
                                styles.itemTypeBadge,
                                item.type === 'service' ? styles.typeService : styles.typeProduct,
                              ]}
                            >
                              {item.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.catalogItemDesc}>{item.desc}</Text>
                          
                          {/* In-Stock Status Pill */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a' }} />
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#15803d' }}>
                              In Stock - Available Now
                            </Text>
                            {item.unit && (
                              <Text style={{ fontSize: 9, color: '#94a3b8', marginLeft: 4 }}>
                                • {item.unit}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={styles.catalogItemPriceCol}>
                          <Text style={styles.catalogItemPrice}>₹{item.price}</Text>
                          <Text style={styles.pinThisItemText}>Tap to pin ↑</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2874f0',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    fontStyle: 'italic',
  },
  brandSub: {
    fontSize: 10,
    color: '#ffe500',
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggleBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewToggleActive: {
    backgroundColor: '#ffe500',
  },
  viewToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2874f0',
  },
  signOutBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  signOutText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  container: {
    padding: 14,
  },
  broadcastBanner: {
    backgroundColor: '#fb641b',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  broadcastBannerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  broadcastBannerSub: {
    color: '#ffedd5',
    fontSize: 10,
    marginTop: 2,
  },
  broadcastArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  locationFilterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  locChangeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2874f0',
  },
  nearestBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  nearestText: {
    fontSize: 11,
    color: '#1e293b',
  },
  radiusRow: {
    marginTop: 4,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  radiusPills: {
    flexDirection: 'row',
    gap: 6,
  },
  radiusBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  radiusBtnActive: {
    backgroundColor: '#2874f0',
  },
  radiusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  radiusBtnTextActive: {
    color: '#ffffff',
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  catBtnActive: {
    backgroundColor: '#2874f0',
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  catBtnTextActive: {
    color: '#ffffff',
  },
  radarCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  radarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  radarSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 10,
  },
  radarScreen: {
    height: 200,
    backgroundColor: '#020617',
    borderRadius: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radarRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  centerPin: {
    alignItems: 'center',
  },
  userDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  userPinText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
  },
  storePin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pinOpen: {
    backgroundColor: '#22c55e',
  },
  pinClosed: {
    backgroundColor: '#ef4444',
  },
  pinLabel: {
    color: '#ffffff',
    fontSize: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  storeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  ratingBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  storeCategory: {
    fontSize: 11,
    color: '#2874f0',
    fontWeight: '700',
    marginTop: 1,
  },
  storeAddress: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  distanceBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productsInset: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productSectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  productName: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeOpen: {
    backgroundColor: '#dcfce7',
  },
  badgeClosed: {
    backgroundColor: '#fee2e2',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotOpen: {
    backgroundColor: '#16a34a',
  },
  dotClosed: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textOpen: {
    color: '#15803d',
  },
  textClosed: {
    color: '#b91c1c',
  },
  dealBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  dealText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#c2410c',
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  chatBtn: {
    backgroundColor: '#2874f0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 10,
  },
  sendEnqBtn: {
    backgroundColor: '#fb641b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  sendEnqBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  chatModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  liveIndicator: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  chatBody: {
    flex: 1,
    marginBottom: 8,
  },
  msgBubble: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#2874f0',
    alignSelf: 'flex-end',
  },
  storeBubble: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
  },
  msgText: {
    fontSize: 11,
  },
  userMsgText: {
    color: '#ffffff',
  },
  storeMsgText: {
    color: '#0f172a',
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
  },
  sendMsgBtn: {
    backgroundColor: '#fb641b',
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendMsgBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  closeChatBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  closeChatText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  productSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tapToOpenHint: {
    fontSize: 10,
    color: '#2874f0',
    fontWeight: '700',
  },
  productRowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewArrow: {
    fontSize: 10,
    color: '#2874f0',
    fontWeight: '700',
  },
  openStoreBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  openStoreBtnText: {
    color: '#2874f0',
    fontSize: 11,
    fontWeight: '800',
  },
  storeDetailTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2874f0',
    gap: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  storeDetailNavTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  storeDetailBanner: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerBadgeTitle: {
    backgroundColor: '#ffe500',
    color: '#1e3a8a',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  bannerDistanceBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: '#0f172a',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  bannerStoreName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  bannerCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffe500',
    marginBottom: 4,
  },
  bannerAddressText: {
    fontSize: 11,
    color: '#e2e8f0',
    marginBottom: 10,
  },
  bannerRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerRating: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '800',
  },
  bannerStatus: {
    fontSize: 10,
    color: '#4ade80',
    fontWeight: '700',
  },
  bannerActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerChatBtn: {
    flex: 1,
    backgroundColor: '#2874f0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  bannerChatBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  bannerCallBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  bannerCallBtnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 12,
  },
  pinnedProductCard: {
    margin: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 2,
    borderColor: '#fcd34d',
    borderRadius: 12,
    padding: 14,
  },
  pinnedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinnedTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  pinnedInStock: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
  },
  pinnedProductName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  pinnedProductDesc: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 16,
  },
  pinnedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinnedPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  pinnedUnit: {
    fontSize: 10,
    color: '#64748b',
  },
  pinnedReserveBtn: {
    backgroundColor: '#fb641b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pinnedReserveBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  inStoreSearchContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inStoreSearchLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  inStoreSearchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  catalogSection: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  catalogSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  catalogItemRow: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  catalogItemRowActive: {
    borderColor: '#f59e0b',
    borderWidth: 1.5,
    backgroundColor: '#fefce8',
  },
  catalogItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  itemTypeBadge: {
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  typeService: {
    backgroundColor: '#f3e8ff',
    color: '#7e22ce',
  },
  typeProduct: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  catalogItemDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  catalogItemUnit: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  catalogItemPriceCol: {
    alignItems: 'flex-end',
  },
  catalogItemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  pinThisItemText: {
    fontSize: 9,
    color: '#2874f0',
    fontWeight: '700',
    marginTop: 2,
  },
  vocalCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  vocalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  vocalBadgeFlag: {
    backgroundColor: '#ea580c',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  digitalIndiaBadge: {
    backgroundColor: '#047857',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vocalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9a3412',
  },
  vocalSlogan: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
    marginBottom: 8,
  },
  vocalMeaningBox: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffedd5',
    gap: 4,
  },
  vocalMeaningText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 14,
  },
  mapNavBtn: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  mapNavBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
});
