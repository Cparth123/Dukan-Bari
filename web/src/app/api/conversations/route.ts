import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const customerId = searchParams.get('customer_id');

    let query = supabaseAdmin
      .from('conversations')
      .select('*, stores(store_name, banner_url), users(full_name, phone_number)')
      .order('last_message_at', { ascending: false });

    if (storeId) {
      query = query.eq('store_id', storeId);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: conversations, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, conversations: conversations || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { store_id, customer_id, initial_message } = body;

    if (!customer_id) {
      return NextResponse.json({ success: false, error: 'Authentication required. Customer must be logged in.' }, { status: 401 });
    }

    if (!store_id) {
      return NextResponse.json({ success: false, error: 'Store ID is required' }, { status: 400 });
    }

    // Verify store exists
    const { data: storeData } = await supabaseAdmin.from('stores').select('id, owner_id').eq('id', store_id).maybeSingle();
    if (!storeData) {
      return NextResponse.json({ success: false, error: 'Store not found.' }, { status: 404 });
    }

    // Verify customer exists in database
    const { data: customerData } = await supabaseAdmin.from('users').select('id').eq('id', customer_id).maybeSingle();
    if (!customerData) {
      return NextResponse.json({ success: false, error: 'Customer account not found. Please log in or sign up.' }, { status: 401 });
    }

    // Check if conversation already exists
    let { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('store_id', store_id)
      .eq('customer_id', customer_id)
      .maybeSingle();

    if (!existing) {
      const { data: created, error } = await supabaseAdmin
        .from('conversations')
        .insert({
          store_id,
          customer_id,
          last_message: initial_message || 'Customer initiated chat',
          last_message_at: new Date().toISOString(),
          unread_count_merchant: 1,
          unread_count_customer: 0
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      existing = created;
    }

    // If initial_message provided, insert to messages table
    if (initial_message && existing) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: existing.id,
        sender_id: customer_id,
        message_type: 'text',
        content: initial_message,
        is_read: false
      });

      await supabaseAdmin
        .from('conversations')
        .update({
          last_message: initial_message,
          last_message_at: new Date().toISOString(),
          unread_count_merchant: (existing.unread_count_merchant || 0) + 1
        })
        .eq('id', existing.id);
    }

    return NextResponse.json({ success: true, conversation: existing });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
