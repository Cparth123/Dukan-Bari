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

export default function LoginScreen({ navigation }: any) {
  const { signIn, signInWithGoogle, setMockRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message || 'Login failed');
    }
  };

  const handleDemoRole = (role: UserRole) => {
    setMockRole(role);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Flipkart Style Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>🏪</Text>
          </View>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>Dukan Bari</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>Plus</Text>
            </View>
          </View>
          <Text style={styles.brandSubtitle}>
            Hyperlocal Store Discovery & Live Merchant Platform (1-5 km)
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In to Your Account</Text>
          <Text style={styles.cardSubtitleText}>
            Access your store dashboard or shopper discovery
          </Text>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address or Mobile</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com or 9876543210"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Primary Action Button - Flipkart Orange */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In to Dukan Bari</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={signInWithGoogle}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to Dukan Bari? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Register Free (0% Fee)</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Switcher */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>⚡ 1-TAP INSTANT ROLE DEMO</Text>
            <View style={styles.demoGrid}>
              <TouchableOpacity
                style={[styles.demoBtn, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
                onPress={() => handleDemoRole('customer')}
              >
                <Text style={[styles.demoBtnRole, { color: '#1d4ed8' }]}>👤 Shopper</Text>
                <Text style={styles.demoBtnSub}>Khareedar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}
                onPress={() => handleDemoRole('shop_owner')}
              >
                <Text style={[styles.demoBtnRole, { color: '#c2410c' }]}>📦 Products</Text>
                <Text style={styles.demoBtnSub}>Gupta Kirana</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
                onPress={() => handleDemoRole('shop_owner')}
              >
                <Text style={[styles.demoBtnRole, { color: '#15803d' }]}>💼 Services</Text>
                <Text style={styles.demoBtnSub}>Sharma Legal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoBtn, { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }]}
                onPress={() => handleDemoRole('superadmin')}
              >
                <Text style={[styles.demoBtnRole, { color: '#7e22ce' }]}>🛡️ Admin</Text>
                <Text style={styles.demoBtnSub}>Platform</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  brandSubtitle: {
    fontSize: 11,
    color: '#dbeafe',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardSubtitleText: {
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
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2874f0',
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
    marginTop: 6,
    shadowColor: '#fb641b',
    shadowOpacity: 0.25,
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 10,
    backgroundColor: '#ffffff',
  },
  googleIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4285f4',
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
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
  signupLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2874f0',
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  demoBtnRole: {
    fontSize: 10,
    fontWeight: '900',
  },
  demoBtnSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
  },
});
