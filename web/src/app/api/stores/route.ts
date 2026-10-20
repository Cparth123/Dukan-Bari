import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to seed initial verified category stores into Supabase if missing
async function ensureVerifiedStoresExist() {
  try {
    const { count } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true });

    if (count !== null && count >= 4) {
      return; // Already populated
    }

    // Get an owner ID from users table
    const { data: firstUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();

    const ownerId = firstUser?.id || 'ad8ea546-e3fc-48ca-a87f-7aa46834d8ff';

    const starterStores = [
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        owner_id: ownerId,
        store_name: 'Sharma & Associates Advocates & Legal Advisors',
        category: 'Advocate & Legal Services',
        business_offering_type: 'service_providing',
        description: 'High Court & District Court Advocates. Legal document drafting, property verification, affidavits & consultation.',
        address_line: 'Chamber 204, Lawyers Complex, Civil Court Road',
        city: 'Surat',
        pincode: '395004',
        latitude: 21.1780,
        longitude: 72.8350,
        location: 'POINT(72.8350 21.1780)',
        is_live_open: true,
        standard_open_time: '09:00 AM',
        standard_close_time: '08:00 PM',
        banner_url: '/advocate-office.jpg',
        logo_url: '/advocate-office.jpg',
        phone_contact: '9811002233',
        whatsapp_number: '9811002233',
        verification_status: 'verified',
        rating: 4.9,
        products: [
          { name: 'Legal Consultation & Document Review', price: 500, discount_price: 300, description: '30 Mins slot', is_in_stock: true, image_url: '/advocate-office.jpg', category: 'Advocate & Legal Services' },
          { name: 'Property Sale Deed & Registry Verification', price: 1500, discount_price: 500, description: 'Complete Check', is_in_stock: true, image_url: '/advocate-office.jpg', category: 'Advocate & Legal Services' },
          { name: 'Affidavit & Rent Agreement Notary', price: 350, discount_price: 150, description: '1 Hour Delivery', is_in_stock: true, image_url: '/advocate-office.jpg', category: 'Advocate & Legal Services' }
        ]
      },
      {
        id: 'a2c8e31f-5e4a-4df2-8174-8b63a9f0291e',
        owner_id: ownerId,
        store_name: 'Gupta General Store',
        category: 'Grocery & Kirana',
        business_offering_type: 'product_selling',
        description: 'Fresh daily groceries, spices, pulses, flours, oils and dairy delivered in 15 mins.',
        address_line: 'Shop 14, Main Market, Sector 5',
        city: 'Surat',
        pincode: '395004',
        latitude: 21.1720,
        longitude: 72.8290,
        location: 'POINT(72.8290 21.1720)',
        is_live_open: true,
        standard_open_time: '08:00 AM',
        standard_close_time: '10:00 PM',
        banner_url: '/gupta-store.jpg',
        logo_url: '/grocery-product.jpg',
        phone_contact: '9876543210',
        whatsapp_number: '9876543210',
        verification_status: 'verified',
        rating: 4.8,
        products: [
          { name: 'Ashirwad Chakki Atta (10 kg)', price: 420, discount_price: 40, description: '10 kg pack', is_in_stock: true, image_url: '/grocery-product.jpg', category: 'Grocery & Kirana' },
          { name: 'Sunehri Gold Sunflower Oil (5 L)', price: 650, discount_price: 70, description: '5 L Jar', is_in_stock: true, image_url: '/grocery-product.jpg', category: 'Grocery & Kirana' },
          { name: 'Kohinoor Basmati Rice (5 kg)', price: 380, discount_price: 60, description: '5 kg bag', is_in_stock: true, image_url: '/grocery-product.jpg', category: 'Grocery & Kirana' }
        ]
      },
      {
        id: 'c5e9b720-6f5b-4c3e-9081-9d74b0e1382f',
        owner_id: ownerId,
        store_name: 'Aggarwal & Co. Chartered Accountants & Tax Advisors',
        category: 'CA & Tax Advisors',
        business_offering_type: 'service_providing',
        description: 'GST compliance, income tax returns, audit & private limited company incorporation advisors.',
        address_line: 'Office 203, 2nd Floor, Commercial Plaza',
        city: 'Surat',
        pincode: '395004',
        latitude: 21.1740,
        longitude: 72.8330,
        location: 'POINT(72.8330 21.1740)',
        is_live_open: true,
        standard_open_time: '10:00 AM',
        standard_close_time: '07:30 PM',
        banner_url: '/ca-advisor.jpg',
        logo_url: '/ca-advisor.jpg',
        phone_contact: '9810012345',
        whatsapp_number: '9810012345',
        verification_status: 'verified',
        rating: 4.9,
        products: [
          { name: 'Income Tax Return (ITR) Filing', price: 799, discount_price: 401, description: 'Per AY', is_in_stock: true, image_url: '/ca-advisor.jpg', category: 'CA & Tax Advisors' },
          { name: 'GST Monthly Return Filing (GSTR-1 & 3B)', price: 1199, discount_price: 401, description: 'Monthly Pack', is_in_stock: true, image_url: '/ca-advisor.jpg', category: 'CA & Tax Advisors' },
          { name: 'Pvt Ltd Company Incorporation', price: 4999, discount_price: 1501, description: 'Complete Pack', is_in_stock: true, image_url: '/ca-advisor.jpg', category: 'CA & Tax Advisors' }
        ]
      }
    ];

    for (const item of starterStores) {
      const { products, ...storeFields } = item;
      const { data: existing } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('id', storeFields.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from('stores').insert([storeFields]);
        // Insert products for this store
        if (products && products.length > 0) {
          const prodsToInsert = products.map((p) => ({
            ...p,
            store_id: storeFields.id
          }));
          await supabaseAdmin.from('products').insert(prodsToInsert);
        }
      }
    }
  } catch (err) {
    console.warn('[ensureVerifiedStoresExist warning]:', err);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const search = searchParams.get('search');
    const userLat = parseFloat(searchParams.get('lat') || '');
    const userLng = parseFloat(searchParams.get('lng') || '');

    // Ensure verified category stores exist in Supabase
    await ensureVerifiedStoresExist();

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
