import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');

    // Fetch open enquiries
    const { data: enquiries, error: enqErr } = await supabaseAdmin
      .from('enquiries')
      .select('*, users(full_name, phone_number)')
      .order('created_at', { ascending: false });

    if (enqErr) {
      return NextResponse.json({ success: false, error: enqErr.message }, { status: 400 });
    }

    // Fetch responses for this store if storeId provided
    let responses: any[] = [];
    if (storeId) {
      const { data: respData } = await supabaseAdmin
        .from('enquiry_responses')
        .select('*')
        .eq('store_id', storeId);
      responses = respData || [];
    }

    return NextResponse.json({
      success: true,
      enquiries: enquiries || [],
      responses
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enquiry_id, store_id, price_quote, note, is_available = true } = body;

    if (!enquiry_id || !store_id) {
      return NextResponse.json({ success: false, error: 'enquiry_id and store_id are required' }, { status: 400 });
    }

    const payload = {
      enquiry_id,
      store_id,
      price_quote: Number(price_quote) || 0,
      note: note || 'Counter stock confirmed by merchant',
      is_available
    };

    const { data: responseRecord, error } = await supabaseAdmin
      .from('enquiry_responses')
      .upsert(payload, { onConflict: 'enquiry_id,store_id' })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, response: responseRecord });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
