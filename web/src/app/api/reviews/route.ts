import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/reviews?store_id=xxx
 * Returns all reviews for a given store
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'store_id is required' }, { status: 400 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from('store_reviews')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      // Table may not exist yet
      console.warn('[reviews GET] Query error:', error.message);
      return NextResponse.json({ success: true, reviews: [] });
    }

    return NextResponse.json({ success: true, reviews: reviews || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Body: { store_id, user_id, user_name, rating (1-5), comment? }
 * - Upserts review (one review per user per store)
 * - Recalculates and updates store avg rating & total_reviews
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store_id, user_id, user_name, rating, comment } = body;

    if (!store_id || !user_id || !rating) {
      return NextResponse.json(
        { success: false, error: 'store_id, user_id and rating are required' },
        { status: 400 }
      );
    }

    const stars = Math.min(5, Math.max(1, Number(rating)));

    // 1. Upsert review (one per user per store)
    const { data: review, error: reviewErr } = await supabaseAdmin
      .from('store_reviews')
      .upsert(
        {
          store_id,
          user_id,
          user_name: user_name || 'Anonymous',
          rating: stars,
          comment: comment || '',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'store_id,user_id' }
      )
      .select('*')
      .single();

    if (reviewErr) {
      console.error('[reviews POST] Upsert error:', reviewErr.message);
      return NextResponse.json({ success: false, error: reviewErr.message }, { status: 400 });
    }

    // 2. Recalculate avg rating for the store
    const { data: allReviews, error: aggErr } = await supabaseAdmin
      .from('store_reviews')
      .select('rating')
      .eq('store_id', store_id);

    if (!aggErr && allReviews && allReviews.length > 0) {
      const totalCount = allReviews.length;
      const avgRating = parseFloat(
        (allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalCount).toFixed(1)
      );

      // 3. Update store's rating + total_reviews
      await supabaseAdmin
        .from('stores')
        .update({
          rating: avgRating,
          total_reviews: totalCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', store_id);
    }

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    console.error('[reviews POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
