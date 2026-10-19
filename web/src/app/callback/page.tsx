'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Verifying Google credentials...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Retrieve current session from URL hash or cookie
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback session error:', error);
          router.push('/login?error=oauth_failed');
          return;
        }

        if (session?.user) {
          setStatus('Finalizing account profile...');
          const user = session.user;
          const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Dukan Bari Member';
          const avatarUrl = user.user_metadata?.avatar_url;

          // Check if user already exists in public.users
          const { data: existingUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          let targetRole = existingUser?.role || 'customer';

          if (!existingUser) {
            // Insert initial record for new Google user
            await supabase.from('users').insert({
              id: user.id,
              full_name: fullName,
              phone_number: user.phone || `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              role: 'customer',
              avatar_url: avatarUrl
            });
          }

          setStatus('Redirecting to your dashboard...');
          if (targetRole === 'superadmin') {
            router.push('/admin');
          } else if (targetRole === 'shop_owner') {
            router.push('/merchant');
          } else {
            router.push('/explore');
          }
        } else {
          // If hash tokens are still being processed by supabase client
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (currentSession?.user) {
              router.push('/explore');
            }
          });

          // Timeout fallback
          setTimeout(() => {
            router.push('/explore');
          }, 3000);
        }
      } catch (err) {
        console.error('OAuth callback handler exception:', err);
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-[#2874f0] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Dukan Bari</h2>
        <p className="text-xs text-slate-500 mb-6">Signing in with Google</p>

        <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#2874f0] mb-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{status}</span>
        </div>
        <p className="text-[11px] text-slate-400">Please wait while we connect your account...</p>
      </div>
    </div>
  );
}
