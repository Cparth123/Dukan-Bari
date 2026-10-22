'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  Layers,
  X
} from 'lucide-react';

interface RealStore {
  id: string;
  owner_id?: string;
  store_name: string;
  category: string;
  business_offering_type?: string;
  description?: string;
  address_line: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_live_open?: boolean;
  phone_contact?: string;
  whatsapp_number?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at?: string;
  products?: any[];
}

export default function SuperadminPortal() {
  const { user, profile, role, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Store data state
  const [stores, setStores] = useState<RealStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Broadcast
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'merchants' | 'customers'>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Modals for CRUD
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditStore, setCurrentEditStore] = useState<RealStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<RealStore | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New store form data
  const [newStore, setNewStore] = useState({
    store_name: '',
    category: 'Grocery & Kirana',
    business_offering_type: 'product_selling',
    description: '',
    address_line: '',
    city: 'Surat',
    pincode: '395004',
    phone_contact: '',
    verification_status: 'verified' as 'pending' | 'verified' | 'rejected'
  });

  // Verify Superadmin Auth strictly
  useEffect(() => {
    if (authLoading) return;

    let isSuper = role === 'superadmin' || profile?.role === 'superadmin';

    if (!isSuper && typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('dukan_admin_token');
      const savedUserStr = localStorage.getItem('dukan_auth_user');
      if (adminToken && savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed.role === 'superadmin') {
            isSuper = true;
          }
        } catch (e) {}
      }
    }

    if (!isSuper) {
      router.replace('/superadmin-login');
    } else {
      setAuthorized(true);
      setCheckingAuth(false);
      fetchStores();
    }
  }, [authLoading, role, profile, router]);

  // Read: Fetch real stores from API
  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const res = await fetch('/api/stores', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.stores)) {
        setStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setActionNotice({ type: 'error', message: 'Failed to connect to stores database.' });
    } finally {
      setLoadingStores(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Update: One-click status update (verify / reject / pending)
  const handleUpdateStatus = async (store: RealStore, newStatus: 'verified' | 'rejected' | 'pending') => {
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: store.id,
          verification_status: newStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, verification_status: newStatus } : s))
        );
        showToast('success', `Store "${store.store_name}" marked as ${newStatus.toUpperCase()}`);
      } else {
        showToast('error', data.error || 'Failed to update store status');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Status update failed');
    }
  };

  // Create: Add Store
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.store_name.trim() || !newStore.address_line.trim()) {
      showToast('error', 'Store name and address are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });
      const data = await res.json();
      if (data.success && data.store) {
        showToast('success', `Store "${newStore.store_name}" created successfully!`);
        setShowAddModal(false);
        setNewStore({
          store_name: '',
          category: 'Grocery & Kirana',
          business_offering_type: 'product_selling',
          description: '',
          address_line: '',
          city: 'Surat',
          pincode: '395004',
          phone_contact: '',
          verification_status: 'verified'
        });
        fetchStores();
      } else {
        showToast('error', data.error || 'Failed to create store');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error creating store');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update: Edit Store Details
  const handleSaveEditStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditStore) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEditStore)
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Store "${currentEditStore.store_name}" updated!`);
        setShowEditModal(false);
        setCurrentEditStore(null);
        fetchStores();
      } else {
        showToast('error', data.error || 'Failed to update store');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating store');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete: Remove Store
  const handleDeleteStore = async () => {
    if (!storeToDelete) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/store?id=${storeToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Store "${storeToDelete.store_name}" deleted.`);
        setStores((prev) => prev.filter((s) => s.id !== storeToDelete.id));
        setStoreToDelete(null);
      } else {
        showToast('error', data.error || 'Failed to delete store');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting store');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Broadcast announcement
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastMessage('');
      setBroadcastSuccess(false);
    }, 3000);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wider uppercase text-purple-400">
          Verifying Superadmin Credentials...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  // Filtered store list
  const filteredStores = stores.filter((s) => {
    const matchesFilter =
      selectedFilter === 'all' ? true : s.verification_status === selectedFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.store_name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.phone_contact?.includes(q) ||
      s.address_line?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/90 border-red-500/60 text-red-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Dukan Bari</h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Superadmin Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">Authenticated: parthchauhan417418@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Store</span>
          </button>

          <button
            onClick={fetchStores}
            title="Refresh Stores"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStores ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={async () => {
              await signOut();
              router.push('/superadmin-login');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Platform Health Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total Stores In Database
                </p>
                <h3 className="text-3xl font-black text-white mt-1">{stores.length}</h3>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400 mt-2">
                  Live Supabase Records
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Store className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Verified Stores
                </p>
                <h3 className="text-3xl font-black text-white mt-1">
                  {stores.filter((s) => s.verification_status === 'verified').length}
                </h3>
                <span className="inline-flex items-center text-xs font-medium text-purple-400 mt-2">
                  Publicly Discovered
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Pending KYC
                </p>
                <h3 className="text-3xl font-black text-white mt-1">
                  {stores.filter((s) => s.verification_status === 'pending').length}
                </h3>
                <span className="inline-flex items-center text-xs font-medium text-amber-400 mt-2">
                  Action Required
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Live Open Counters
                </p>
                <h3 className="text-3xl font-black text-white mt-1">
                  {stores.filter((s) => s.is_live_open).length}
                </h3>
                <span className="inline-flex items-center text-xs font-medium text-emerald-400 mt-2">
                  Open on Radar
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Real CRUD Operations Desk */}
        <section className="rounded-2xl bg-slate-800/40 border border-slate-700/80 overflow-hidden">
          <div className="p-6 border-b border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Store Management Desk (CRUD)</span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {filteredStores.length} Stores
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create new stores, update metadata, verify KYC approvals, and delete stores.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700 text-xs font-semibold">
                {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab)}
                    className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                      selectedFilter === tab
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, city, phone..."
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 pl-8 text-white placeholder-slate-500 outline-none focus:border-purple-500 w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Store & Category</th>
                  <th className="px-6 py-4">Address & City</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status & Radar</th>
                  <th className="px-6 py-4 text-right">CRUD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loadingStores ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                      Loading stores from database...
                    </td>
                  </tr>
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                      No stores found matching current filter or search.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{store.store_name}</span>
                          <a
                            href={`/store/${store.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Public Page"
                            className="text-slate-400 hover:text-purple-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <span className="text-xs text-purple-400 font-medium">
                          {store.category} · {store.products?.length || 0} items
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>
                            {store.address_line}, {store.city} ({store.pincode})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{store.phone_contact || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${
                              store.verification_status === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : store.verification_status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {store.verification_status}
                          </span>
                          {store.is_live_open ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Counter Live Open" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600" title="Closed" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Verify */}
                          {store.verification_status !== 'verified' && (
                            <button
                              onClick={() => handleUpdateStatus(store, 'verified')}
                              title="Approve & Verify"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Reject */}
                          {store.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(store, 'rejected')}
                              title="Reject KYC"
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setCurrentEditStore(store);
                              setShowEditModal(true);
                            }}
                            title="Edit Store Metadata"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Store */}
                          <button
                            onClick={() => setStoreToDelete(store)}
                            title="Delete Store From Platform"
                            className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900/60 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Broadcast System Section */}
        <section className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Global Superadmin Push Broadcast</h3>
          </div>
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Compose network-wide alert to merchants and active shoppers..."
                className="flex-1 bg-slate-900 border border-slate-700 text-sm rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2.5 text-slate-300 outline-none"
              >
                <option value="all">Broadcast to All Users</option>
                <option value="merchants">Merchants Only</option>
                <option value="customers">Customers Only</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Alert</span>
              </button>
            </div>
            {broadcastSuccess && (
              <p className="text-xs text-emerald-400 font-medium animate-fadeIn">
                ✓ Superadmin broadcast dispatched across active geofence zones!
              </p>
            )}
          </form>
        </section>
      </main>

      {/* CREATE MODAL: Add Store */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-400" />
                <span>Create New Store</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={newStore.store_name}
                  onChange={(e) => setNewStore({ ...newStore, store_name: e.target.value })}
                  placeholder="e.g. Anand Dairy & Sweets"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={newStore.category}
                    onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Grocery & Kirana">Grocery & Kirana</option>
                    <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                    <option value="Panipuri & Chaat Lari">Panipuri & Chaat Lari</option>
                    <option value="Advocate & Legal Services">Advocate & Legal Services</option>
                    <option value="CA & Tax Advisors">CA & Tax Advisors</option>
                    <option value="Bakery & Dairy">Bakery & Dairy</option>
                    <option value="Electronics & Mobile">Electronics & Mobile</option>
                    <option value="Food, Dhabas & Restaurants">Food, Dhabas & Restaurants</option>
                    <option value="Hair Saloon & Grooming">Hair Saloon & Grooming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Business Type</label>
                  <select
                    value={newStore.business_offering_type}
                    onChange={(e) => setNewStore({ ...newStore, business_offering_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="product_selling">Product Selling</option>
                    <option value="service_providing">Service Providing</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={newStore.phone_contact}
                  onChange={(e) => setNewStore({ ...newStore, phone_contact: e.target.value })}
                  placeholder="e.g. 9811002233"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newStore.address_line}
                  onChange={(e) => setNewStore({ ...newStore, address_line: e.target.value })}
                  placeholder="e.g. Shop 4, Main Market, Sector 12"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={newStore.city}
                    onChange={(e) => setNewStore({ ...newStore, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newStore.pincode}
                    onChange={(e) => setNewStore({ ...newStore, pincode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Initial Verification Status</label>
                <select
                  value={newStore.verification_status}
                  onChange={(e) => setNewStore({ ...newStore, verification_status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                >
                  <option value="verified">Verified (Active immediately)</option>
                  <option value="pending">Pending KYC Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE MODAL: Edit Store */}
      {showEditModal && currentEditStore && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-400" />
                <span>Edit Store: {currentEditStore.store_name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentEditStore(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStore} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={currentEditStore.store_name}
                  onChange={(e) =>
                    setCurrentEditStore({ ...currentEditStore, store_name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={currentEditStore.category}
                    onChange={(e) =>
                      setCurrentEditStore({ ...currentEditStore, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Grocery & Kirana">Grocery & Kirana</option>
                    <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                    <option value="Panipuri & Chaat Lari">Panipuri & Chaat Lari</option>
                    <option value="Advocate & Legal Services">Advocate & Legal Services</option>
                    <option value="CA & Tax Advisors">CA & Tax Advisors</option>
                    <option value="Bakery & Dairy">Bakery & Dairy</option>
                    <option value="Electronics & Mobile">Electronics & Mobile</option>
                    <option value="Food, Dhabas & Restaurants">Food, Dhabas & Restaurants</option>
                    <option value="Hair Saloon & Grooming">Hair Saloon & Grooming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={currentEditStore.verification_status}
                    onChange={(e) =>
                      setCurrentEditStore({
                        ...currentEditStore,
                        verification_status: e.target.value as any
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={currentEditStore.phone_contact || ''}
                  onChange={(e) =>
                    setCurrentEditStore({ ...currentEditStore, phone_contact: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Address</label>
                <input
                  type="text"
                  value={currentEditStore.address_line}
                  onChange={(e) =>
                    setCurrentEditStore({ ...currentEditStore, address_line: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={currentEditStore.city}
                    onChange={(e) =>
                      setCurrentEditStore({ ...currentEditStore, city: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={currentEditStore.pincode}
                    onChange={(e) =>
                      setCurrentEditStore({ ...currentEditStore, pincode: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editLiveOpen"
                  checked={Boolean(currentEditStore.is_live_open)}
                  onChange={(e) =>
                    setCurrentEditStore({ ...currentEditStore, is_live_open: e.target.checked })
                  }
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="editLiveOpen" className="text-slate-300 font-bold cursor-pointer">
                  Counter is Currently Live Open on Radar
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentEditStore(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Store?</h3>
                <p className="text-xs text-slate-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Are you sure you want to delete <strong className="text-white">{storeToDelete.store_name}</strong>? All associated products and media will be removed from the platform.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStoreToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteStore}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
