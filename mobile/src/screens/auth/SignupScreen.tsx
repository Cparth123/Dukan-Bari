import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth, UserRole } from '../../context/AuthContext';

export type BusinessOfferingType = 'product_selling' | 'service_providing' | 'both';

export default function SignupScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [role, setRole] = useState<UserRole>('customer');
  const [offeringType, setOfferingType] = useState<BusinessOfferingType>('product_selling');

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Store fields
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Grocery & Kirana');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic categories based on offering type
  const productCategories = [
    'Pan Masala & Paan Parlour',
    'Panipuri & Live Chaat Lari',
    'Grocery & Kirana Store',
    'Vegetable & Fruit Thela',
    'Dairy & Fresh Milk Parlour',
    'Bakery, Farsan & Sweets',
    'Pharmacy & Medical Store',
    'Mobile & Electronics',
    'Clothing & Garments',
    'Hardware & Electricals',
    'Cycle & Puncture Repair',
    'Puja Samagri & Flowers'
  ];

  const serviceCategories = [
    'Hair Saloon & Grooming',
    'Beauty Parlour & Mehndi Artist',
    'Mochi & Footwear Repair',
    'Tailor & Alteration Works',
    'Dhobi & Ironing Laundry',
    'Advocate & Legal Advisory',
    'CA & Tax Advisor (GST/ITR)',
    'Doctor & Clinic Consultation',
    'Electrician & Wireman',
    'Plumber & Sanitary Repair',
    'AC & Appliance Repair',
    'Mobile & Laptop Repair'
  ];

  const bothCategories = [
    'Panipuri & Chaat Lari',
    'Chai Kitli & Nasta Point',
    'Dhaba & Punjabi Food',
    'Kathiyawadi & Family Dining',
    'Fast Food & Chinese Corner',
    'Cafe & Bakery Delights',
    'Catering & Party Events'
  ];

  const currentCategories =
    offeringType === 'product_selling'
      ? productCategories
      : offeringType === 'service_providing'
      ? serviceCategories
      : bothCategories;

  const handleOfferingTypeChange = (type: BusinessOfferingType) => {
    setOfferingType(type);
    if (type === 'product_selling') setCategory(productCategories[0]);
    else if (type === 'service_providing') setCategory(serviceCategories[0]);
    else setCategory(bothCategories[0]);
  };

  const handleSignup = async () => {
    if (!fullName || !phoneNumber || !password) {
      setErrorMsg('Please enter Full Name, Phone Number, and Password');
      return;
    }

    if (role === 'shop_owner' && (!storeName || !address)) {
      setErrorMsg('Please enter business name and physical address');
      return;
    }

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
          }
        : undefined;

    const { error } = await signUp(
      email,
      password,
      role,
      fullName,
      phoneNumber,
      storeDetails
    );

    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Signup failed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Flipkart Style Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>🏪</Text>
          </View>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Dukan Bari</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>Plus</Text>
            </View>
          </View>
          <Text style={styles.headerTagline}>
            Hyperlocal Marketplace (1-5 km) • 0% Commission
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create an Account</Text>
          <Text style={styles.cardSubtitle}>
            Join 10,000+ local sellers, service providers & shoppers
          </Text>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* 1. Role Picker */}
          <Text style={styles.label}>1. Choose Your Role</Text>
          <View style={styles.roleTabs}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'customer' && styles.roleTabActive]}
              onPress={() => setRole('customer')}
            >
              <Text
                style={[
                  styles.roleTabText,
                  role === 'customer' && styles.roleTabTextActive,
                ]}
              >
                👤 Khareedar (Shopper)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'shop_owner' && styles.roleTabActive]}
              onPress={() => setRole('shop_owner')}
            >
              <Text
                style={[
                  styles.roleTabText,
                  role === 'shop_owner' && styles.roleTabTextActive,
                ]}
              >
                🏪 Dukandar / Vyapari
              </Text>
            </TouchableOpacity>
          </View>

          {/* DUKANDAR SPECIAL SECTION: OFFERING TYPE */}
          {role === 'shop_owner' && (
            <View style={styles.storeSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeading}>2. Business Offering Type</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={styles.sectionSub}>
                What does your business offer to local customers?
              </Text>

              {/* 3 Offering Type Cards */}
              <View style={styles.offeringGrid}>
                {/* 1. Products */}
                <TouchableOpacity
                  style={[
                    styles.offeringCard,
                    offeringType === 'product_selling' && styles.offeringCardActive,
                  ]}
                  onPress={() => handleOfferingTypeChange('product_selling')}
                >
                  <Text style={styles.offeringIcon}>📦</Text>
                  <Text
                    style={[
                      styles.offeringTitle,
                      offeringType === 'product_selling' && styles.offeringTitleActive,
                    ]}
                  >
                    Product Selling
                  </Text>
                  <Text style={styles.offeringDesc}>Kirana, Medical, Electronics</Text>
                </TouchableOpacity>

                {/* 2. Services */}
                <TouchableOpacity
                  style={[
                    styles.offeringCard,
                    offeringType === 'service_providing' && styles.offeringCardActive,
                  ]}
                  onPress={() => handleOfferingTypeChange('service_providing')}
                >
                  <Text style={styles.offeringIcon}>💼</Text>
                  <Text
                    style={[
                      styles.offeringTitle,
                      offeringType === 'service_providing' && styles.offeringTitleActive,
                    ]}
                  >
                    Service Provider
                  </Text>
                  <Text style={styles.offeringDesc}>Advocate, CA, Clinic, Repair</Text>
                </TouchableOpacity>

                {/* 3. Both */}
                <TouchableOpacity
                  style={[
                    styles.offeringCard,
                    offeringType === 'both' && styles.offeringCardActive,
                  ]}
                  onPress={() => handleOfferingTypeChange('both')}
                >
                  <Text style={styles.offeringIcon}>🍽️</Text>
                  <Text
                    style={[
                      styles.offeringTitle,
                      offeringType === 'both' && styles.offeringTitleActive,
                    ]}
                  >
                    Both / Food
                  </Text>
                  <Text style={styles.offeringDesc}>Dhaba, Restaurant, Bakery</Text>
                </TouchableOpacity>
              </View>

              {/* Business Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {offeringType === 'service_providing'
                    ? 'Firm / Office / Clinic Name'
                    : 'Shop / Store Name'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    offeringType === 'service_providing'
                      ? 'Sharma Legal & CA Advisory'
                      : offeringType === 'both'
                      ? 'Punjab Dhaba & Restaurant'
                      : 'Gupta General Store'
                  }
                  placeholderTextColor="#94a3b8"
                  value={storeName}
                  onChangeText={setStoreName}
                />
              </View>

              {/* Dynamic Category Chips */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.label}>Select Category</Text>
                  <TouchableOpacity onPress={() => setIsCustomCategory(!isCustomCategory)}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#2874f0' }}>
                      {isCustomCategory ? '← Choose list' : '+ Custom Category'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isCustomCategory ? (
                  <TextInput
                    style={[styles.input, { borderColor: '#2874f0', borderWidth: 2, backgroundColor: '#eff6ff' }]}
                    placeholder="Enter custom category (e.g. Matka Kulfi, Chaviwala)"
                    placeholderTextColor="#94a3b8"
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {currentCategories.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.categoryChip,
                          category === c && styles.categoryChipActive,
                        ]}
                        onPress={() => setCategory(c)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            category === c && styles.categoryChipTextActive,
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.categoryChip, { borderColor: '#2874f0', borderStyle: 'dashed' }]}
                      onPress={() => setIsCustomCategory(true)}
                    >
                      <Text style={[styles.categoryChipText, { color: '#2874f0', fontWeight: '800' }]}>
                        ✨ + Add Custom
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>

              {/* Physical Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop / Office Physical Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Shop 14, Main Market, Sector 5"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>
          )}

          {/* User Basic Info */}
          <Text style={styles.label}>
            {role === 'shop_owner' ? '3. Owner Contact Details' : '2. Personal Details'}
          </Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Full Name (e.g. Ramesh Kumar)"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g. 9876543210)"
              placeholderTextColor="#94a3b8"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email Address (Optional)"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Password (At least 6 characters)"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Primary CTA - Flipkart Orange */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {role === 'shop_owner'
                  ? offeringType === 'service_providing'
                    ? 'Register as Service Provider'
                    : offeringType === 'both'
                    ? 'Register Food Business'
                    : 'Register as Dukandar (0% Fee)'
                  : 'Register as Khareedar (Shopper)'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in to Dukan Bari</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f3f6',
  },
  container: {
    padding: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#2874f0',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#2874f0',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoBadgeText: {
    fontSize: 22,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#ffffff',
  },
  plusBadge: {
    backgroundColor: '#ffe500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  plusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2874f0',
    fontStyle: 'italic',
  },
  headerTagline: {
    fontSize: 11,
    color: '#dbeafe',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#2874f0',
    shadowColor: '#2874f0',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  storeSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  newBadge: {
    backgroundColor: '#ffe500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1e3a8a',
  },
  sectionSub: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 10,
  },
  offeringGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  offeringCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  offeringCardActive: {
    borderColor: '#2874f0',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  offeringIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  offeringTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
  offeringTitleActive: {
    color: '#2874f0',
  },
  offeringDesc: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#2874f0',
    borderColor: '#2874f0',
  },
  categoryChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#fb641b',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#fb641b',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2874f0',
  },
});
