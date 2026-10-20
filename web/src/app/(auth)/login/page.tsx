'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Store,
  ShieldCheck,
  User,
  ShoppingBag,
  Briefcase,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Percent,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { signInWithEmail, signInWithGoogle, setMockRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error, role } = await signInWithEmail(email, password);

    if (error) {
      setErrorMsg(error.message || 'Login failed. Please verify credentials.');
      setLoading(false);
      return;
    }

    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }

    if (role === 'superadmin') {
      router.push('/admin');
    } else if (role === 'shop_owner') {
      router.push('/merchant');
    } else {
      router.push('/explore');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    setMockRole(role);
    if (redirectUrl) {
      router.push(redirectUrl);
      return;
    }
    if (role === 'superadmin') router.push('/admin');
    else if (role === 'shop_owner') router.push('/merchant');
    else router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      {/* 1. Flipkart-style Top Bar */}
      <header className="bg-[#2874f0] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white text-[#2874f0] flex items-center justify-center font-black shadow">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-xl font-black italic tracking-tight text-white">Dukan Bari</span>
                <span className="text-[10px] font-black italic text-[#ffe500] px-1 bg-[#1a5bc7] rounded">
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

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold">
            <Link href="/explore" className="text-white hover:text-[#ffe500] transition-colors hidden sm:inline-block">
              Explore Stores & Services
            </Link>
            <span className="text-blue-300 hidden sm:inline">|</span>
            <span className="text-blue-100">New to Dukan Bari?</span>
            <Link
              href={redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'}
              className="bg-[#ffe500] text-[#1a5bc7] hover:bg-[#ebd200] px-4 py-1.5 rounded-sm font-extrabold shadow-sm transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Two-Column Flipkart Split Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex items-center">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full min-h-[580px]">
          
          {/* LEFT COLUMN: Flipkart Seller Hub Hero Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1a5bc7] via-[#2874f0] to-[#0d47a1] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#ffe500]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#ffe500] text-[#1a5bc7] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Hyperlocal Merchant & Shopper Portal</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                  Welcome to India's Hyperlocal Network
                </h1>
                <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                  Log in to manage your local store, accept reverse customer enquiries, or discover trusted shops & services near you.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-[#ffe500] text-[#1a5bc7] flex items-center justify-center font-bold flex-shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-black text-white block">Retail Goods & Grocery</span>
                    <span className="text-blue-100">Live stock, MRP comparisons & instant pickup</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-emerald-400 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-black text-white block">Local Professional Services</span>
                    <span className="text-blue-100">Advocates, CA Tax advisors, doctors & repair pros</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/15">
                  <div className="w-7 h-7 rounded-md bg-amber-400 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-black text-white block">0% Platform Commission</span>
                    <span className="text-blue-100">100% Direct UPI payments directly into your account</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant preview avatar */}
            <div className="mt-8 relative z-10 pt-4 border-t border-white/20 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#ffe500] shadow-md flex-shrink-0">
                <Image
                  src="/hero-dukandar.jpg"
                  alt="Dukan Bari Merchant"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs">
                <div className="text-[#ffe500] font-black text-xs">★★★★★ Verified Merchant Platform</div>
                <p className="text-blue-100 text-[11px] mt-0.5">Connecting local neighbourhood buyers and sellers in 1-5km</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Flipkart Style Login Card */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            
            <div className="border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Your Account</h2>
                  <p className="text-xs text-slate-500 mt-1">Access your store dashboard or shopper discovery</p>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-[#2874f0] px-3 py-1.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Login</span>
                </div>
              </div>
            </div>

            {redirectUrl && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-[#1a5bc7] flex items-center gap-2.5 text-xs font-semibold">
                <Lock className="w-4 h-4 flex-shrink-0 text-[#2874f0]" />
                <span>Authentication required. Please log in or sign up to start direct live messaging and store conversations.</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email or Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or 9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-[#2874f0] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* PRIMARY SUBMIT CTA - FLIPKART ORANGE */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fb641b] hover:bg-[#e65a17] text-white font-extrabold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dukan Bari</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR DIVIDER */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
              </div>
            </div>

            {/* GOOGLE SIGN IN */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="block text-center text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">
                ⚡ 1-Tap Quick Role Tester
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('customer')}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-center transition-colors"
                >
                  <span className="block text-[11px] font-black">👤 Khareedar</span>
                  <span className="block text-[9px] text-blue-600">Local Shopper</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('shop_owner')}
                  className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#fb641b] border border-orange-200 text-center transition-colors"
                >
                  <span className="block text-[11px] font-black">📦 Products</span>
                  <span className="block text-[9px] text-orange-600">Gupta Kirana</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('shop_owner')}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-center transition-colors"
                >
                  <span className="block text-[11px] font-black">💼 Services</span>
                  <span className="block text-[9px] text-emerald-600">Sharma Legal & CA</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('superadmin')}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-center transition-colors"
                >
                  <span className="block text-[11px] font-black">🛡️ Admin</span>
                  <span className="block text-[9px] text-purple-600">Full Platform</span>
                </button>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              New to Dukan Bari?{' '}
              <Link
                href={redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'}
                className="font-black text-[#2874f0] hover:underline"
              >
                Create an Account (0% Commission)
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#2874f0]" />
            <span>Loading login portal...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
