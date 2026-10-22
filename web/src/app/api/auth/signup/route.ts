import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function resolveAuthEmail(identifier?: string, phoneFallback?: string) {
  const raw = (identifier || '').trim();
  if (raw.includes('@')) {
    const [local, domain] = raw.split('@');
    const cleanLocal = local.replace(/[^a-zA-Z0-9._-]/g, '') || 'user';
    const cleanDomain = (domain || '').toLowerCase().trim();
    const blockedDomains = ['test.com', 'example.com', 'temp.com', 'sample.com', 'dukanbari.com', 'localhost'];
    if (!cleanDomain || blockedDomains.includes(cleanDomain) || !cleanDomain.includes('.')) {
      return `dukanbari.${cleanLocal}@gmail.com`;
    }
    return `${cleanLocal}@${cleanDomain}`;
  }
  const cleanPhone = (phoneFallback || raw).replace(/[^0-9]/g, '');
  const phoneToken = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone || Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `dukanbari.phone.${phoneToken}@gmail.com`;
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Signup API endpoint is active' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role, fullName, phoneNumber, storeDetails } = body;

    if (!password || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password must be at least 4 characters long' }, { status: 400 });
    }

    const cleanPassword = (password && password.length >= 6) ? password : `${password || 'pass123'}123`;
    const validAuthEmail = resolveAuthEmail(email, phoneNumber);
    let userId: string | null = null;

    // Check if user already exists in auth
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find(
      (u) => u.email?.toLowerCase() === validAuthEmail.toLowerCase()
    );

    if (existing) {
      userId = existing.id;
      // Update existing user with new password & metadata, pre-confirmed
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone_number: phoneNumber,
          role: role || 'customer',
        }
      });
    } else {
      // Create user pre-confirmed to bypass email rate limits
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: validAuthEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone_number: phoneNumber,
          role: role || 'customer',
        }
      });

      if (createErr) {
        console.warn('Admin createUser notice:', createErr);
      } else if (newUser?.user) {
        userId = newUser.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Could not create authenticated user in Supabase auth system' }, { status: 500 });
    }

    // Upsert into public.users
    try {
      await supabaseAdmin.from('users').upsert({
        id: userId,
        email: validAuthEmail,
        phone_number: phoneNumber || '9876543210',
        full_name: fullName || 'Dukan Bari User',
        role: role || 'customer'
      }, { onConflict: 'id' });
    } catch (dbErr) {
      console.warn('Users upsert warning:', dbErr);
    }

    // If merchant, insert store record
    let createdStoreId: string | undefined;
    if (role === 'shop_owner' && storeDetails) {
      try {
        const { data: existingStore } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('owner_id', userId)
          .maybeSingle();

        if (existingStore) {
          createdStoreId = existingStore.id;
          await supabaseAdmin
            .from('stores')
            .update({
              store_name: storeDetails.storeName || `${fullName}'s Store`,
              category: storeDetails.category || 'General Store',
              business_offering_type: storeDetails.offeringType || 'product_selling',
              address_line: storeDetails.address || '',
              city: storeDetails.city || 'Surat',
              pincode: storeDetails.pincode || '395004',
              phone_contact: phoneNumber || '9876543210',
              whatsapp_number: phoneNumber || '9876543210',
              verification_status: 'verified'
            })
            .eq('id', existingStore.id);
        } else {
          const { data: newStore } = await supabaseAdmin
            .from('stores')
            .insert({
              owner_id: userId,
              store_name: storeDetails.storeName || `${fullName}'s Store`,
              category: storeDetails.category || 'General Store',
              business_offering_type: storeDetails.offeringType || 'product_selling',
              address_line: storeDetails.address || '',
              city: storeDetails.city || 'Surat',
              pincode: storeDetails.pincode || '395004',
              phone_contact: phoneNumber || '9876543210',
              whatsapp_number: phoneNumber || '9876543210',
              latitude: 21.1702,
              longitude: 72.8311,
              is_live_open: true,
              verification_status: 'verified'
            })
            .select('id')
            .single();

          createdStoreId = newStore?.id;
        }
      } catch (storeErr) {
        console.warn('Store creation warning:', storeErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: validAuthEmail,
        phone_number: phoneNumber,
        full_name: fullName,
        role: role || 'customer',
        store_id: createdStoreId
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
