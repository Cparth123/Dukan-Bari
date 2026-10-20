import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (!conversationId) {
      return NextResponse.json({ success: false, error: 'conversation_id is required' }, { status: 400 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*, users(full_name, role)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { conversation_id, sender_id, content, message_type = 'text', media_url, metadata = {} } = body;

    if (!conversation_id || (!content && !media_url)) {
      return NextResponse.json({ success: false, error: 'conversation_id and content required' }, { status: 400 });
    }

    if (!sender_id) {
      return NextResponse.json({ success: false, error: 'Authentication required. Sender must be logged in.' }, { status: 401 });
    }

    const { data: newMessage, error: msgErr } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id,
        sender_id,
        message_type,
        content: content || 'Attachment',
        media_url: media_url || null,
        metadata: metadata || {},
        is_read: false
      })
      .select('*, users(full_name, role)')
      .single();

    if (msgErr) {
      return NextResponse.json({ success: false, error: msgErr.message }, { status: 400 });
    }

    // Update parent conversation last message
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message: content || (message_type === 'image' ? '📷 Photo' : 'Price Quote'),
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation_id);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
