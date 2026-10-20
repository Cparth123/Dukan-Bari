'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Store,
  Users,
  MessageSquare,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Radio,
  Search,
  LogOut,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface MockStoreKyc {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  status: 'pending' | 'verified' | 'rejected';
  registeredAt: string;
}

export default function SuperadminPortal() {
  const { profile, signOut, setMockRole } = useAuth();
  const router = useRouter();

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'merchants' | 'customers'>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Mock stores pending / approved for demonstration
  const [stores, setStores] = useState<MockStoreKyc[]>([
    {
      id: 'store-1',
      name: 'Sharma General Kirana',
      category: 'Grocery & Kirana',
      ownerName: 'Sunil Sharma',
      phone: '+91 9811223344',
      address: 'Plot 45, Sector 12 Market',
      city: 'New Delhi',
      status: 'pending',
      registeredAt: '10 mins ago',
    },
    {
      id: 'store-2',
      name: 'Apollo Lifeline Chemist',
      category: 'Pharmacy & Medical',
      ownerName: 'Dr. Vikrant Roy',
      phone: '+91 9822334455',
      address: 'Shop 12, Main Road',
      city: 'New Delhi',
      status: 'verified',
      registeredAt: '2 days ago',
    },
    {
      id: 'store-3',
      name: 'Balaji Dairy & Sweets',
      category: 'Bakery & Dairy',
      ownerName: 'Manoj Yadav',
      phone: '+91 9833445566',
      address: 'Near Metro Pillar 84',
      city: 'New Delhi',
      status: 'pending',
      registeredAt: '1 hour ago',
    },
    {
      id: 'store-4',
      name: 'Mobile Junction & Repair',
      category: 'Electronics & Mobile',
      ownerName: 'Amir Khan',
      phone: '+91 9844556677',
      address: 'UG Floor, City Galleria',
      city: 'New Delhi',
      status: 'rejected',
      registeredAt: '3 days ago',
    },
  ]);

  const handleVerify = (storeId: string, newStatus: 'verified' | 'rejected' | 'pending') => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, status: newStatus } : s))
    );
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastMessage('');
      setBroadcastSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Dukan Bari</h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Superadmin
              </span>
            </div>
            <p className="text-xs text-slate-400">Platform Control & Onboarding Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PostGIS Geofence: Active</span>
          </div>

          <button
            onClick={() => {
              signOut();
              router.push('/login');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Platform Health Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Registered Stores</p>
                <h3 className="text-3xl font-black text-white mt-1">1,428</h3>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400 mt-2">
                  +18 today
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Store className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Active Live Shoppers</p>
                <h3 className="text-3xl font-black text-white mt-1">24,890</h3>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400 mt-2">
                  Within 1-5km grids
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Live 1-to-1 Chats</p>
                <h3 className="text-3xl font-black text-white mt-1">382</h3>
                <span className="inline-flex items-center text-xs font-medium text-purple-400 mt-2">
                  Socket.io active rooms
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Reverse Enquiries 24h</p>
                <h3 className="text-3xl font-black text-white mt-1">619</h3>
                <span className="inline-flex items-center text-xs font-medium text-amber-400 mt-2">
                  89% response rate
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Merchant Verification & Onboarding Desk */}
        <section className="rounded-2xl bg-slate-800/40 border border-slate-700/80 overflow-hidden">
          <div className="p-6 border-b border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Merchant KYC & Onboarding Queue</span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {stores.filter((s) => s.status === 'pending').length} Pending
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Approve or reject physical store registration and address verification
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Store & Category</th>
                  <th className="px-6 py-4">Owner & Contact</th>
                  <th className="px-6 py-4">Physical Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{s.name}</div>
                      <span className="text-xs text-purple-400">{s.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{s.ownerName}</div>
                      <div className="text-xs text-slate-400">{s.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{s.address}, {s.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Pending Review
                        </span>
                      )}
                      {s.status === 'verified' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Verified
                        </span>
                      )}
                      {s.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {s.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleVerify(s.id, 'verified')}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(s.id, 'rejected')}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleVerify(s.id, 'pending')}
                            className="text-xs text-slate-400 hover:text-white underline"
                          >
                            Re-evaluate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Broadcast Management */}
        <section className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">System-Wide Broadcast Alerts</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Dispatch urgent platform announcements or emergency weather/market alerts via FCM push notifications.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                Target Audience:
                <select
                  value={broadcastTarget}
                  onChange={(e: any) => setBroadcastTarget(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Users (Shoppers & Merchants)</option>
                  <option value="merchants">Merchants Only</option>
                  <option value="customers">Customers / Shoppers Only</option>
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. System Maintenance Notice: Chat engine updates scheduled tonight 2:00 AM"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Alert</span>
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Broadcast message queued and dispatched across operational zones.</span>
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
