import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractStoragePath } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

    if (storeId && storeId !== 'my-store' && storeId !== 'store-1') {
      query = query.eq('store_id', storeId);
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, products: products || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    let storeId = body.store_id;
    let validStore = false;
    if (storeId && storeId.length > 20 && storeId !== 'my-store' && storeId !== 'store-1') {
      const { data: checkStore } = await supabaseAdmin.from('stores').select('id').eq('id', storeId).maybeSingle();
      if (checkStore?.id) validStore = true;
    }

    if (!validStore) {
      const { data: firstStore } = await supabaseAdmin.from('stores').select('id').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (firstStore?.id) {
        storeId = firstStore.id;
      } else {
        const { data: firstUser } = await supabaseAdmin.from('users').select('id').limit(1).maybeSingle();
        const ownerId = firstUser?.id;
        if (ownerId) {
          const { data: createdStore } = await supabaseAdmin.from('stores').insert({
            owner_id: ownerId,
            store_name: 'My Store',
            category: 'Grocery & Kirana',
            address_line: 'Surat Main Road',
            city: 'Surat',
            pincode: '395004'
          }).select('id').single();
          storeId = createdStore?.id;
        }
      }
    }

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'Valid store_id is required' }, { status: 400 });
    }

    const price = Number(body.price) || 0;
    const mrp = Number(body.mrp) || price;
    const discountPrice = mrp > price ? mrp - price : (Number(body.discount_price) || 0);

    const payload = {
      store_id: storeId,
      name: body.name.trim(),
      description: body.description || '',
      price: price,
      discount_price: discountPrice,
      category: body.category || body.categoryTag || 'General',
      image_url: body.image_url || body.image || '/grocery-product.jpg',
      is_in_stock: typeof body.is_in_stock === 'boolean' ? body.is_in_stock : (typeof body.inStock === 'boolean' ? body.inStock : true),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Insert product error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: inserted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product id is required for update' }, { status: 400 });
    }

    const price = Number(body.price) || 0;
    const mrp = Number(body.mrp) || price;
    const discountPrice = mrp > price ? mrp - price : (Number(body.discount_price) || 0);

    const updatePayload: any = {
      name: body.name?.trim(),
      description: body.description || '',
      price: price,
      discount_price: discountPrice,
      category: body.category || body.categoryTag || 'General',
      image_url: body.image_url || body.image || '/grocery-product.jpg',
      is_in_stock: typeof body.is_in_stock === 'boolean' ? body.is_in_stock : (typeof body.inStock === 'boolean' ? body.inStock : true),
      updated_at: new Date().toISOString()
    };

    // If updating image_url to a new one, clean up the previous image from Supabase Store bucket
    if (body.image_url && body.id) {
      try {
        const { data: existingProd } = await supabaseAdmin
          .from('products')
          .select('image_url')
          .eq('id', body.id)
          .maybeSingle();

        if (existingProd?.image_url && existingProd.image_url !== body.image_url) {
          const oldPath = extractStoragePath(existingProd.image_url, 'Store');
          const newPath = extractStoragePath(body.image_url, 'Store');
          if (oldPath && oldPath !== newPath) {
            await supabaseAdmin.storage.from('Store').remove([oldPath]);
            console.log(`[PUT /api/products] Synchronously removed replaced old product image '${oldPath}' from bucket`);
          }
        }
      } catch (cleanErr) {
        console.warn('[PUT /api/products] Notice cleaning up previous product image:', cleanErr);
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', body.id)
      .select('*')
      .single();

    if (error) {
      console.error('Update product error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product id is required' }, { status: 400 });
    }

    // 1. Fetch product first to extract its Supabase storage image_url
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .eq('id', id)
      .maybeSingle();

    let imageDeleted = false;
    let deletedImagePath: string | null = null;

    if (product?.image_url) {
      const storagePath = extractStoragePath(product.image_url, 'Store');
      if (storagePath) {
        try {
          const { error: removeStorageError } = await supabaseAdmin
            .storage
            .from('Store')
            .remove([storagePath]);

          if (!removeStorageError) {
            imageDeleted = true;
            deletedImagePath = storagePath;
            console.log(`[DELETE /api/products] Synchronously removed product image '${storagePath}' from Supabase bucket 'Store'`);
          } else {
            console.warn(`[DELETE /api/products] Notice removing image '${storagePath}':`, removeStorageError.message);
          }
        } catch (stErr) {
          console.warn('[DELETE /api/products] Storage exception removing image:', stErr);
        }
      }
    }

    // 2. Delete the product record from Supabase database
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedProduct: product?.name,
      imageDeleted,
      deletedImagePath
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
