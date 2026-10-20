import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractStoragePath } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    let query = supabaseAdmin.from('announcements_and_offers').select('*').order('created_at', { ascending: false });

    if (storeId && storeId !== 'my-store' && storeId !== 'store-1') {
      query = query.eq('store_id', storeId);
    }

    const { data: offers, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, offers: offers || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ success: false, error: 'Deal title is required' }, { status: 400 });
    }

    let storeId = body.store_id;
    if (!storeId || storeId === 'my-store' || storeId === 'store-1') {
      const { data: firstStore } = await supabaseAdmin.from('stores').select('id').limit(1).maybeSingle();
      storeId = firstStore?.id;
    }

    const validUntilDate = body.valid_until ? new Date(body.valid_until).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

    const payload = {
      store_id: storeId,
      title: body.title.trim(),
      description: body.description || '',
      discount_tag: body.discount_tag || body.discountTag || 'SPECIAL OFFER',
      banner_image: body.banner_image || body.bannerImage || '/barber-service.jpg',
      valid_until: validUntilDate,
      radius_km: Number(body.radius_km || body.radiusKm) || 3.0,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : (typeof body.isActive === 'boolean' ? body.isActive : true)
    };

    const { data: inserted, error } = await supabaseAdmin
      .from('announcements_and_offers')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, offer: inserted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Offer id is required' }, { status: 400 });
    }

    const updatePayload: any = {
      title: body.title?.trim(),
      description: body.description || '',
      discount_tag: body.discount_tag || body.discountTag,
      banner_image: body.banner_image || body.bannerImage,
      radius_km: Number(body.radius_km || body.radiusKm) || 3.0,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : (typeof body.isActive === 'boolean' ? body.isActive : true)
    };

    if (body.valid_until) {
      updatePayload.valid_until = new Date(body.valid_until).toISOString();
    }

    const { data: updated, error } = await supabaseAdmin
      .from('announcements_and_offers')
      .update(updatePayload)
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, offer: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Offer id is required' }, { status: 400 });
    }

    // 1. Fetch offer to get associated banner_image in Supabase storage
    const { data: offer } = await supabaseAdmin
      .from('announcements_and_offers')
      .select('id, title, banner_image')
      .eq('id', id)
      .maybeSingle();

    let imageDeleted = false;
    let deletedImagePath: string | null = null;

    if (offer?.banner_image) {
      const storagePath = extractStoragePath(offer.banner_image, 'Store');
      if (storagePath) {
        try {
          const { error: removeStorageError } = await supabaseAdmin
            .storage
            .from('Store')
            .remove([storagePath]);

          if (!removeStorageError) {
            imageDeleted = true;
            deletedImagePath = storagePath;
            console.log(`[DELETE /api/offers] Synchronously removed offer image '${storagePath}' from Supabase bucket 'Store'`);
          } else {
            console.warn(`[DELETE /api/offers] Notice removing offer image '${storagePath}':`, removeStorageError.message);
          }
        } catch (stErr) {
          console.warn('[DELETE /api/offers] Storage exception removing image:', stErr);
        }
      }
    }

    // 2. Delete offer record from database
    const { error } = await supabaseAdmin.from('announcements_and_offers').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedTitle: offer?.title,
      imageDeleted,
      deletedImagePath
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
