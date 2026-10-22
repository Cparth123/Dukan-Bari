import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const search = searchParams.get('search');
    const userLat = parseFloat(searchParams.get('lat') || '');
    const userLng = parseFloat(searchParams.get('lng') || '');

    // 1. Fetch stores from Supabase
    let query = supabaseAdmin
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'All' && category !== 'all') {
      // Case-insensitive match on category
      query = query.ilike('category', `%${category.trim()}%`);
    }

    if (city && city !== 'All Cities' && city !== 'all') {
      query = query.ilike('city', `%${city.trim()}%`);
    }

    const { data: stores, error: storesError } = await query;

    if (storesError) {
      console.error('[API /api/stores] Supabase error:', storesError);
      return NextResponse.json({ success: false, error: storesError.message, stores: [] }, { status: 400 });
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        stores: []
      });
    }

    // 2. Fetch all products for the returned stores
    const storeIds = stores.map((s) => s.id);
    const { data: allProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('store_id', storeIds)
      .order('created_at', { ascending: true });

    if (productsError) {
      console.warn('[API /api/stores] Products fetch warning:', productsError.message);
    }

    // 3. Fetch active deals/offers for the returned stores
    const { data: allOffers, error: offersError } = await supabaseAdmin
      .from('offers')
      .select('*')
      .in('store_id', storeIds)
      .eq('is_active', true);

    if (offersError) {
      console.warn('[API /api/stores] Offers fetch warning:', offersError.message);
    }

    // 4. Map products and offers to each store, calculate real distance if user coordinates provided
    const enrichedStores = stores.map((store) => {
      const storeProducts = (allProducts || []).filter((p) => p.store_id === store.id);
      const storeOffers = (allOffers || []).filter((o) => o.store_id === store.id);
      const activeDeal = storeOffers.length > 0 ? storeOffers[0].discount_tag || storeOffers[0].title : undefined;

      // Distance calculation (Haversine formula) if userLat & userLng exist
      let distanceKm = 0.5; // fallback
      let walkMinutes = 4;
      if (!isNaN(userLat) && !isNaN(userLng) && store.latitude && store.longitude) {
        const dLat = ((Number(store.latitude) - userLat) * Math.PI) / 180;
        const dLng = ((Number(store.longitude) - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((Number(store.latitude) * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = parseFloat((6371 * c).toFixed(1));
        walkMinutes = Math.max(1, Math.round(distanceKm * 12)); // ~12 mins per km walking
      }

      // Map Angle for interactive radar
      const mapAngle = Math.floor(Math.random() * 340) + 10;

      return {
        id: store.id,
        name: store.store_name,
        category: store.category,
        businessOfferingType: store.business_offering_type || 'service_providing',
        description: store.description || '',
        address: store.address_line || 'Surat Main Road',
        city: store.city || 'Surat',
        pincode: store.pincode || '',
        state: state || 'Gujarat',
        phone: store.phone_contact || '9925299431',
        whatsapp: store.whatsapp_number || store.phone_contact || '9925299431',
        bannerImg: store.banner_url || '/gupta-store.jpg',
        logoImg: store.logo_url || null,
        isLiveOpen: store.is_live_open ?? true,
        openTime: store.standard_open_time || '08:30 AM',
        closeTime: store.standard_close_time || '10:00 PM',
        rating: Number(store.rating) || 4.9,
        reviewsCount: store.total_reviews || 0,
        lat: Number(store.latitude) || 21.1702,
        lng: Number(store.longitude) || 72.8311,
        distanceKm,
        walkMinutes,
        mapAngle,
        activeDeal,
        statusBadge: store.is_live_open
          ? `Live Open · Closes at ${store.standard_close_time || '10:00 PM'}`
          : 'Closed (Counter Shutter Down)',
        badgeBg: store.is_live_open ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
        showcaseProducts: storeProducts.map((p) => ({
          name: p.name,
          price: Number(p.price) || 0,
          mrp: (Number(p.price) || 0) + (Number(p.discount_price) || 0),
          category: p.category || store.category,
          description: p.description || '',
          image: p.image_url || store.banner_url || '/barber-service.jpg',
          inStock: p.is_in_stock ?? true,
          stockStatus: p.is_in_stock ? 'In Stock' : 'Unavailable',
          weight: p.description || '1 Unit'
        })),
        offers: storeOffers
      };
    });

    // Optional Search filter in memory
    let finalStores = enrichedStores;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      finalStores = finalStores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.showcaseProducts.some((p: any) => p.name.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: finalStores.length,
      stores: finalStores
    });
  } catch (err: any) {
    console.error('[API /api/stores] Unhandled error:', err);
    return NextResponse.json({ success: false, error: err.message, stores: [] }, { status: 500 });
  }
}
