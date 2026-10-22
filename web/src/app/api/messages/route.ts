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

    // Deduplicate any repeated messages (same sender, same content, within 4 seconds)
    const uniqueMessages = (messages || []).filter((msg, idx, arr) => {
      const firstIdx = arr.findIndex(
        (m) =>
          m.id === msg.id ||
          (m.sender_id === msg.sender_id &&
            m.content === msg.content &&
            Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 4000)
      );
      return idx === firstIdx;
    });

    return NextResponse.json({ success: true, messages: uniqueMessages });
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

    // Check if duplicate message was posted within 4 seconds
    const targetContent = content || 'Attachment';
    const { data: recentDup } = await supabaseAdmin
      .from('messages')
      .select('*, users(full_name, role)')
      .eq('conversation_id', conversation_id)
      .eq('sender_id', sender_id)
      .eq('content', targetContent)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentDup && (Date.now() - new Date(recentDup.created_at).getTime() < 4000)) {
      return NextResponse.json({ success: true, message: recentDup });
    }

    const { data: newMessage, error: msgErr } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id,
        sender_id,
        message_type,
        content: targetContent,
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
