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

interface StoreItem {
  id: string;
  name: string;
  category: string;
  owner: string;
  phone: string;
  status: 'pending' | 'verified' | 'rejected';
}

export default function SuperadminDashboardScreen() {
  const { signOut } = useAuth();

  const [stores, setStores] = useState<StoreItem[]>([
    {
      id: '1',
      name: 'Sharma General Kirana',
      category: 'Grocery & Kirana',
      owner: 'Sunil Sharma',
      phone: '+91 9811223344',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Apollo Lifeline Chemist',
      category: 'Pharmacy & Medical',
      owner: 'Dr. Vikrant Roy',
      phone: '+91 9822334455',
      status: 'verified',
    },
    {
      id: '3',
      name: 'Balaji Dairy & Sweets',
      category: 'Bakery & Dairy',
      owner: 'Manoj Yadav',
      phone: '+91 9833445566',
      status: 'pending',
    },
  ]);

  const [broadcastText, setBroadcastText] = useState('');

  const handleAction = (id: string, newStatus: 'verified' | 'rejected') => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    Alert.alert('Alert Broadcasted', 'System alert dispatched across all active geofenced clusters.');
    setBroadcastText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topRole}>SUPERADMIN PORTAL</Text>
          <Text style={styles.topTitle}>Platform Operations</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Metric Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Stores</Text>
            <Text style={styles.statValue}>1,428</Text>
            <Text style={styles.statSub}>+18 today</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Live Users</Text>
            <Text style={styles.statValue}>24.8k</Text>
            <Text style={styles.statSub}>1-5km radius</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Live Chats</Text>
            <Text style={styles.statValue}>382</Text>
            <Text style={styles.statSub}>Socket active</Text>
          </View>
        </View>

        {/* KYC Onboarding Queue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Merchant KYC Verification</Text>
          <Text style={styles.sectionSubtitle}>
            Approve or reject physical store registration
          </Text>

          {stores.map((s) => (
            <View key={s.id} style={styles.storeCard}>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{s.name}</Text>
                <Text style={styles.storeCategory}>{s.category}</Text>
                <Text style={styles.storeOwner}>
                  {s.owner} · {s.phone}
                </Text>
              </View>

              <View style={styles.actionCol}>
                {s.status === 'pending' ? (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleAction(s.id, 'verified')}
                    >
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleAction(s.id, 'rejected')}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.statusPill,
                      s.status === 'verified'
                        ? styles.pillVerified
                        : styles.pillRejected,
                    ]}
                  >
                    {s.status.toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Global Broadcast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Broadcast Alert</Text>
          <Text style={styles.sectionSubtitle}>
            Push urgent message to all stores & customers
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Type emergency alert or announcement..."
            placeholderTextColor="#94a3b8"
            value={broadcastText}
            onChangeText={setBroadcastText}
          />

          <TouchableOpacity style={styles.broadcastBtn} onPress={handleBroadcast}>
            <Text style={styles.broadcastBtnText}>📡 Dispatch Push Alert</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  topRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c084fc',
    letterSpacing: 0.8,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  signOutText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  container: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  statSub: {
    fontSize: 9,
    color: '#4ade80',
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14,
    marginTop: 2,
  },
  storeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  storeInfo: {
    marginBottom: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  storeCategory: {
    fontSize: 11,
    color: '#c084fc',
    fontWeight: '600',
  },
  storeOwner: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  actionCol: {
    alignItems: 'flex-start',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pillVerified: {
    backgroundColor: '#052e16',
    color: '#4ade80',
  },
  pillRejected: {
    backgroundColor: '#450a0a',
    color: '#f87171',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 12,
  },
  broadcastBtn: {
    backgroundColor: '#9333ea',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  broadcastBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
