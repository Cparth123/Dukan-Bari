import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'superadmin' | 'shop_owner' | 'customer';

export interface MobileUserProfile {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  storeId?: string;
}

interface AuthContextType {
  user: MobileUserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (emailOrPhone: string, pass: string) => Promise<{ error: Error | null; role?: UserRole }>;
  signUp: (
    email: string,
    pass: string,
    role: UserRole,
    fullName: string,
    phoneNumber: string,
    storeDetails?: {
      storeName: string;
      category: string;
      offeringType?: 'product_selling' | 'service_providing' | 'both';
      address: string;
    }
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setMockRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to ensure Supabase Auth accepts the identifier (Phone or Email)
  const resolveAuthEmail = (identifier?: string, phoneFallback?: string) => {
    const raw = (identifier || '').trim();
    if (raw.includes('@')) {
      const [local, domain] = raw.split('@');
      const cleanLocal = local.replace(/[^a-zA-Z0-9._-]/g, '') || 'user';
      const cleanDomain = (domain || '').toLowerCase();
      if (!cleanDomain || ['test.com', 'example.com', 'temp.com', 'sample.com'].includes(cleanDomain) || !cleanDomain.includes('.')) {
        return `${cleanLocal}@dukanbari.com`;
      }
      return `${cleanLocal}@${cleanDomain}`;
    }
    const cleanPhone = (phoneFallback || raw).replace(/[^0-9]/g, '');
    const phoneToken = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    return `${phoneToken}@dukanbari.com`;
  };

  const signIn = async (emailOrPhone: string, pass: string) => {
    setLoading(true);
    try {
      const resolvedEmail = resolveAuthEmail(emailOrPhone, emailOrPhone);

      let { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: pass,
      });

      if (error && emailOrPhone.includes('@') && emailOrPhone !== resolvedEmail) {
        const retry = await supabase.auth.signInWithPassword({
          email: emailOrPhone.trim(),
          password: pass,
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) throw error;

      // Determine role from user metadata or fallback
      const userRole = (data.user?.user_metadata?.role as UserRole) || 'customer';
      const prof: MobileUserProfile = {
        id: data.user?.id || 'usr-1',
        fullName: data.user?.user_metadata?.full_name || 'Dukan Bari Shopper',
        email: data.user?.email,
        role: userRole,
      };

      setUser(prof);
      setRole(userRole);
      setLoading(false);
      return { error: null, role: userRole };
    } catch (err: any) {
      setLoading(false);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    chosenRole: UserRole,
    fullName: string,
    phoneNumber: string,
    storeDetails?: {
      storeName: string;
      category: string;
      offeringType?: 'product_selling' | 'service_providing' | 'both';
      address: string;
    }
  ) => {
    setLoading(true);
    try {
      const validAuthEmail = resolveAuthEmail(email, phoneNumber);

      const { data, error } = await supabase.auth.signUp({
        email: validAuthEmail,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            display_email: email || `${phoneNumber}@dukanbari.com`,
            role: chosenRole,
            ...storeDetails,
          },
        },
      });

      if (error) throw error;

      const prof: MobileUserProfile = {
        id: data.user?.id || 'usr-new',
        fullName,
        email,
        phoneNumber,
        role: chosenRole,
        storeId: chosenRole === 'shop_owner' ? 'store-new' : undefined,
      };

      setUser(prof);
      setRole(chosenRole);
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // In mobile app, trigger Supabase OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  // Switch demo roles with one tap for instant testing on mobile device/emulator
  const setMockRole = (mockRole: UserRole) => {
    setRole(mockRole);
    setUser({
      id: 'demo-user-1',
      fullName:
        mockRole === 'superadmin'
          ? 'Platform Admin'
          : mockRole === 'shop_owner'
          ? 'Gupta General Store'
          : 'Rahul Sharma',
      email: `${mockRole}@dukanbari.com`,
      phoneNumber: '+91 9876543210',
      role: mockRole,
      storeId: mockRole === 'shop_owner' ? 'store-demo-1' : undefined,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        forgotPassword,
        signOut,
        setMockRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
