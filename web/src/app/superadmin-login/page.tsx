'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { signInSuperadmin } = useAuth();

  const [email, setEmail] = useState('parthchauhan417418@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: loginError } = await signInSuperadmin(email.trim(), password);
      if (loginError) {
        setError(loginError.message || 'Invalid Superadmin credentials.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Superadmin authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Security Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-4 shadow-lg shadow-purple-900/30">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Superadmin Gateway</h1>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Restricted Platform Operations Access</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center gap-2.5 text-xs text-purple-300">
            <KeyRound className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Authorized credentials required. Superadmin access is strictly logged & audited.</span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center gap-2.5 text-xs text-red-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Authorized! Redirecting to Superadmin Portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Superadmin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@domain.com"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm rounded-xl px-4 py-2.5 pl-10 placeholder-slate-500 transition-all outline-none"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white text-sm rounded-xl px-4 py-2.5 pl-10 placeholder-slate-500 transition-all outline-none"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Unlock Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          <span>Dukan Bari Plus Platform Security · Dedicated Host Session</span>
        </div>
      </div>
    </div>
  );
}
