import { NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';
import { extractStoragePath } from '@/lib/storage';

export const dynamic = 'force-dynamic';

function getCategoryFallbackBanner(category?: string, name?: string): string {
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  if (text.includes('hair') || text.includes('saloon') || text.includes('salon') || text.includes('barber') || text.includes('grooming')) {
    return '/hero-dukandar.jpg';
  }
  if (text.includes('advocate') || text.includes('legal') || text.includes('law')) {
    return '/advocate-office.jpg';
  }
  if (text.includes('pharma') || text.includes('chemist') || text.includes('medic') || text.includes('doctor')) {
    return '/apollo-pharmacy.jpg';
  }
  if (text.includes('restaurant') || text.includes('dhaba') || text.includes('food') || text.includes('cafe')) {
    return '/punjab-dhaba.jpg';
  }
  return '/gupta-store.jpg';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ownerId = searchParams.get('owner_id');

    let query = supabaseAdmin.from('stores').select('*');

    if (id && id !== 'my-store' && id !== 'store-1') {
      query = query.eq('id', id);
    } else if (ownerId) {
      query = query.eq('owner_id', ownerId);
    } else {
      // Return the most recent store or match
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data: store, error: storeError } = await query.maybeSingle();
    let finalStore = store;

    if (!finalStore && !ownerId && !id) {
      // Check if any store exists (only for public anonymous fallback)
      const { data: anyStores } = await supabaseAdmin
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (anyStores && anyStores.length > 0) {
        finalStore = anyStores[0];
      }
    }

    if (!finalStore) {
      return NextResponse.json({ success: true, store: null, products: [] });
    }

    // Auto-resolve banner image from Supabase Storage if banner_url is empty/null
    let resolvedBannerUrl = finalStore.banner_url;
    if (!resolvedBannerUrl) {
      try {
        const { data: bannerFiles } = await supabaseAdmin.storage
          .from('Store')
          .list('banners');
        const matched = bannerFiles?.find((f) => f.name.includes(finalStore.id));
        if (matched) {
          resolvedBannerUrl = `https://ynfglaxkvocijjnrgobl.supabase.co/storage/v1/object/public/Store/banners/${matched.name}`;
          // Persist auto-healed URL to stores table
          await supabaseAdmin.from('stores').update({ banner_url: resolvedBannerUrl }).eq('id', finalStore.id);
        }
      } catch (storageErr) {
        console.warn('Storage banner detection warning:', storageErr);
      }

      // If still no custom banner found, provide category fallback banner
      if (!resolvedBannerUrl) {
        resolvedBannerUrl = getCategoryFallbackBanner(finalStore.category, finalStore.store_name);
      }
    }

    finalStore = {
      ...finalStore,
      banner_url: resolvedBannerUrl
    };

    // Fetch products for this store
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('store_id', finalStore.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, store: finalStore, products: products || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if updating an existing store by id or owner_id
    let targetStoreId = (body.id && body.id.length > 20 && body.id !== 'my-store' && body.id !== 'store-1') ? body.id : null;

    if (!targetStoreId && body.owner_id) {
      const { data: existingByOwner } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('owner_id', body.owner_id)
        .maybeSingle();
      if (existingByOwner?.id) {
        targetStoreId = existingByOwner.id;
      }
    }

    if (targetStoreId) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (body.store_name !== undefined) updateData.store_name = body.store_name;
      if (body.name !== undefined) updateData.store_name = body.name;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.business_offering_type !== undefined) updateData.business_offering_type = body.business_offering_type;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.aboutText !== undefined) updateData.description = body.aboutText;
      if (body.address_line !== undefined) updateData.address_line = body.address_line;
      if (body.address !== undefined) updateData.address_line = body.address;
      if (body.city !== undefined) updateData.city = body.city;
      if (body.pincode !== undefined) updateData.pincode = body.pincode;
      if (body.latitude !== undefined) {
        updateData.latitude = Number(body.latitude);
        if (body.longitude !== undefined) {
          updateData.longitude = Number(body.longitude);
          updateData.location = `POINT(${updateData.longitude} ${updateData.latitude})`;
        }
      }
      if (typeof body.is_live_open === 'boolean') updateData.is_live_open = body.is_live_open;
      if (body.standard_open_time !== undefined) updateData.standard_open_time = body.standard_open_time;
      if (body.standard_close_time !== undefined) updateData.standard_close_time = body.standard_close_time;
      if (body.banner_url) updateData.banner_url = body.banner_url;
      else if (body.bannerImg) updateData.banner_url = body.bannerImg;
      if (body.logo_url) updateData.logo_url = body.logo_url;
      else if (body.shopPhotoUrl) updateData.logo_url = body.shopPhotoUrl;
      if (body.verification_status !== undefined) updateData.verification_status = body.verification_status;
      if (body.phone_contact !== undefined) updateData.phone_contact = body.phone_contact;
      else if (body.phone !== undefined) updateData.phone_contact = body.phone;
      if (body.whatsapp_number !== undefined) updateData.whatsapp_number = body.whatsapp_number;
      else if (body.whatsapp !== undefined) updateData.whatsapp_number = body.whatsapp;

      const { data: updatedStore, error: updateError } = await supabaseAdmin
        .from('stores')
        .update(updateData)
        .eq('id', targetStoreId)
        .select('*')
        .single();

      if (updateError) {
        console.error('Update store error:', updateError);
        return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, store: updatedStore });
    }

    // Resolve owner_id to a valid existing user in users table
    let ownerId = body.owner_id;
    let validOwner = false;
    if (ownerId && ownerId.length > 20) {
      const { data: userCheck } = await supabaseAdmin.from('users').select('id').eq('id', ownerId).maybeSingle();
      if (userCheck?.id) {
        validOwner = true;
      }
    }

    if (!validOwner) {
      const { data: latestUser } = await supabaseAdmin.from('users').select('id').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (latestUser?.id) {
        ownerId = latestUser.id;
      } else {
        // Auto-provision a verified user so foreign key constraint succeeds
        const { data: autoUser } = await supabaseAdmin.auth.admin.createUser({
          email: 'merchant@dukanbari.com',
          password: 'password123',
          email_confirm: true
        });
        if (autoUser?.user) {
          ownerId = autoUser.user.id;
          await supabaseAdmin.from('users').upsert({
            id: ownerId,
            email: 'merchant@dukanbari.com',
            full_name: 'Dukan Bari Merchant',
            role: 'shop_owner',
            phone_number: '9876543210'
          });
        }
      }
    }

    const lat = Number(body.latitude) || 21.1702;
    const lng = Number(body.longitude) || 72.8311;
    const locationPoint = `POINT(${lng} ${lat})`;

    const storePayload: any = {
      owner_id: ownerId,
      store_name: body.store_name || body.name || 'My Local Store',
      category: body.category || 'Grocery & Kirana',
      business_offering_type: body.business_offering_type || 'service_providing',
      description: body.description || body.aboutText || '',
      address_line: body.address_line || body.address || 'Surat Main Road',
      city: body.city || 'Surat',
      pincode: body.pincode || '395004',
      latitude: lat,
      longitude: lng,
      location: locationPoint,
      is_live_open: typeof body.is_live_open === 'boolean' ? body.is_live_open : true,
      standard_open_time: body.standard_open_time || '08:30:00',
      standard_close_time: body.standard_close_time || '22:00:00',
      banner_url: body.banner_url || body.bannerImg || '/hero-dukandar.jpg',
      logo_url: body.logo_url || null,
      phone_contact: body.phone_contact || body.phone || '9925299431',
      whatsapp_number: body.whatsapp_number || body.whatsapp || '9925299431',
      verification_status: 'verified',
      updated_at: new Date().toISOString()
    };

    const { data: savedStore, error: saveError } = await supabaseAdmin
      .from('stores')
      .upsert(storePayload)
      .select('*')
      .single();

    if (saveError) {
      console.error('Save store error:', saveError);
      return NextResponse.json({ success: false, error: saveError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, store: savedStore });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Store id is required' }, { status: 400 });
    }

    // 1. Fetch store to find banner & logo images
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id, store_name, banner_url, logo_url')
      .eq('id', id)
      .maybeSingle();

    // 2. Fetch all products of this store to collect product images
    const { data: prods } = await supabaseAdmin
      .from('products')
      .select('image_url')
      .eq('store_id', id);

    const pathsToDelete: string[] = [];

    if (store?.banner_url) {
      const p = extractStoragePath(store.banner_url, 'Store');
      if (p) pathsToDelete.push(p);
    }
    if (store?.logo_url) {
      const p = extractStoragePath(store.logo_url, 'Store');
      if (p) pathsToDelete.push(p);
    }
    if (prods && prods.length > 0) {
      for (const prod of prods) {
        if (prod.image_url) {
          const p = extractStoragePath(prod.image_url, 'Store');
          if (p && !pathsToDelete.includes(p)) pathsToDelete.push(p);
        }
      }
    }

    // 3. Remove all images synchronously from Supabase Store bucket
    if (pathsToDelete.length > 0) {
      try {
        await supabaseAdmin.storage.from('Store').remove(pathsToDelete);
        console.log(`[DELETE /api/store] Synchronously removed ${pathsToDelete.length} images from Supabase bucket:`, pathsToDelete);
      } catch (stErr) {
        console.warn('[DELETE /api/store] Warning removing images from storage:', stErr);
      }
    }

    // 4. Delete products then delete store
    await supabaseAdmin.from('products').delete().eq('store_id', id);
    const { error: storeDeleteErr } = await supabaseAdmin.from('stores').delete().eq('id', id);

    if (storeDeleteErr) {
      return NextResponse.json({ success: false, error: storeDeleteErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedStoreId: id,
      deletedStoreName: store?.store_name,
      deletedImages: pathsToDelete
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
