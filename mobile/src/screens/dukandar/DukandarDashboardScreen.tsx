import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface EnquiryItem {
  id: string;
  customer: string;
  item: string;
  desc: string;
  distance: string;
  quotedPrice?: string;
  replied: boolean;
}

export default function DukandarDashboardScreen() {
  const { user, signOut } = useAuth();
  const [isLiveOpen, setIsLiveOpen] = useState(true);

  // Reverse Enquiry Radar
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([
    {
      id: '1',
      customer: 'Priya Verma',
      item: 'Fortune Sunflower Oil 5L',
      desc: 'Need 1 can urgent delivery or counter pickup.',
      distance: '0.8 km',
      replied: false,
    },
    {
      id: '2',
      customer: 'Anand Mishra',
      item: 'Aashirvaad Atta 10kg',
      desc: 'Looking for 10kg bag. Available?',
      distance: '1.4 km',
      quotedPrice: '₹420',
      replied: true,
    },
  ]);

  const [quoteInput, setQuoteInput] = useState<{ [key: string]: string }>({});

  // Flash Deal Publisher
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscount, setDealDiscount] = useState('FLAT 20% OFF');

  const handleReply = (id: string) => {
    const price = quoteInput[id] || '250';
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, replied: true, quotedPrice: `₹${price}` } : e))
    );
    Alert.alert('Quote Sent', `Customer informed of availability at ₹${price}`);
  };

  const handlePublishDeal = () => {
    if (!dealTitle.trim()) return;
    Alert.alert(
      'Flash Deal Broadcasted',
      `Push alert "${dealDiscount}: ${dealTitle}" sent to nearby app users within 3 km.`
    );
    setDealTitle('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topRole}>DUKANDAR DESK</Text>
          <Text style={styles.topTitle}>{user?.fullName || 'Gupta General Store'}</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 1-Tap Live Status Toggle */}
        <TouchableOpacity
          style={[
            styles.statusBanner,
            isLiveOpen ? styles.statusOpen : styles.statusClosed,
          ]}
          onPress={() => setIsLiveOpen(!isLiveOpen)}
        >
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                isLiveOpen ? styles.dotOpen : styles.dotClosed,
              ]}
            />
            <Text style={styles.statusBannerText}>
              {isLiveOpen ? 'STORE IS LIVE OPEN · TAP TO CLOSE' : 'STORE IS CLOSED · TAP TO OPEN'}
            </Text>
          </View>
          <Text style={styles.statusHint}>
            {isLiveOpen
              ? 'Visible on user maps & feeds within 5 km'
              : 'Hidden from discovery feeds'}
          </Text>
        </TouchableOpacity>

        {/* Reverse Enquiry Desk */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shopper Reverse-Enquiry Radar</Text>
            <Text style={styles.badgeNear}>Within 3 km</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Shoppers seeking items nearby right now. Reply with price to win orders!
          </Text>

          {enquiries.map((enq) => (
            <View key={enq.id} style={styles.enqCard}>
              <View style={styles.enqTop}>
                <Text style={styles.enqCustomer}>{enq.customer}</Text>
                <Text style={styles.enqDistance}>{enq.distance}</Text>
              </View>

              <Text style={styles.enqItem}>"{enq.item}"</Text>
              <Text style={styles.enqDesc}>{enq.desc}</Text>

              {enq.replied ? (
                <View style={styles.repliedBadge}>
                  <Text style={styles.repliedText}>Quoted {enq.quotedPrice} ✓</Text>
                </View>
              ) : (
                <View style={styles.replyRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="₹ Price"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={quoteInput[enq.id] || ''}
                    onChangeText={(val) => setQuoteInput({ ...quoteInput, [enq.id]: val })}
                  />
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={() => handleReply(enq.id)}
                  >
                    <Text style={styles.replyBtnText}>Reply in 1 Tap</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Flash Deals & Geofenced Push Broadcast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Post Flash Deal & Push Alert</Text>
          <Text style={styles.sectionSubtitle}>
            Sends targeted alert to all shoppers within 3 km
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Discount Tag (e.g. FLAT 20% OFF)"
            placeholderTextColor="#94a3b8"
            value={dealDiscount}
            onChangeText={setDealDiscount}
          />

          <TextInput
            style={styles.input}
            placeholder="Deal Title (e.g. Fresh Mangoes & Fruits arrived!)"
            placeholderTextColor="#94a3b8"
            value={dealTitle}
            onChangeText={setDealTitle}
          />

          <TouchableOpacity style={styles.dealBtn} onPress={handlePublishDeal}>
            <Text style={styles.dealBtnText}>🔥 Broadcast Geofenced Alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7aa',
  },
  topRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ea580c',
    letterSpacing: 0.8,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  signOutText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  container: {
    padding: 16,
  },
  statusBanner: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusClosed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotOpen: {
    backgroundColor: '#16a34a',
  },
  dotClosed: {
    backgroundColor: '#dc2626',
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusHint: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 18,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#ea580c',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  badgeNear: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
    marginTop: 2,
  },
  enqCard: {
    backgroundColor: '#fffaf5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  enqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  enqCustomer: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  enqDistance: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  enqItem: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ea580c',
    marginBottom: 2,
  },
  enqDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
  },
  replyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    width: 90,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0f172a',
  },
  replyBtn: {
    flex: 1,
    backgroundColor: '#ea580c',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  repliedBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  repliedText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10,
  },
  dealBtn: {
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  dealBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
