import { NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEMO_ACCOUNTS = {
  shop_owner_products: {
    email: 'merchant.products@dukanbari.com',
    password: 'password123',
    role: 'shop_owner',
    fullName: 'Gupta General Store',
    phone: '9876543210',
    storeName: 'Gupta General Store',
    category: 'Grocery & Kirana',
    offeringType: 'product_selling',
    address: 'Shop 14, Main Market, Sector 5',
    city: 'Surat',
    pincode: '395004'
  },
  shop_owner_services: {
    email: 'merchant.services@dukanbari.com',
    password: 'password123',
    role: 'shop_owner',
    fullName: 'Sharma Legal & CA Advisors',
    phone: '9811002233',
    storeName: 'Sharma Legal & CA Advisors',
    category: 'Advocate & Legal Services',
    offeringType: 'service_providing',
    address: 'Chamber 204, Lawyers Complex, Civil Court Road',
    city: 'Surat',
    pincode: '395004'
  },
  customer: {
    email: 'customer.shopper@dukanbari.com',
    password: 'password123',
    role: 'customer',
    fullName: 'Rahul Sharma (Local Shopper)',
    phone: '9898001122'
  },
  superadmin: {
    email: 'parthchauhan417418@gmail.com',
    password: 'password123',
    role: 'superadmin',
    fullName: 'Parth Chauhan (Superadmin)',
    phone: '9876543210'
  }
};

export async function POST(request: Request) {
  try {
    const { roleType } = await request.json();
    const config = (DEMO_ACCOUNTS as any)[roleType] || DEMO_ACCOUNTS.customer;

    // 1. Check or create in auth.users
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    let authUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === config.email.toLowerCase()
    );

    if (!authUser) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: config.email,
        password: config.password,
        email_confirm: true,
        user_metadata: {
          full_name: config.fullName,
          phone_number: config.phone,
          role: config.role
        }
      });
      if (created?.user) authUser = created.user;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: config.password,
        email_confirm: true
      });
    }

    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Failed to create demo auth user' }, { status: 500 });
    }

    // 2. Upsert in public.users
    await supabaseAdmin.from('users').upsert({
      id: authUser.id,
      email: config.email,
      phone_number: config.phone,
      full_name: config.fullName,
      role: config.role
    }, { onConflict: 'id' });

    // 3. Upsert store if merchant
    let storeId: string | undefined;
    if (config.role === 'shop_owner' && config.storeName) {
      const { data: existingStore } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('owner_id', authUser.id)
        .maybeSingle();

      if (existingStore) {
        storeId = existingStore.id;
      } else {
        const { data: newStore } = await supabaseAdmin
          .from('stores')
          .insert({
            owner_id: authUser.id,
            store_name: config.storeName,
            category: config.category,
            business_offering_type: config.offeringType,
            address_line: config.address,
            city: config.city,
            pincode: config.pincode,
            phone_contact: config.phone,
            whatsapp_number: config.phone,
            latitude: 21.1702,
            longitude: 72.8311,
            is_live_open: true,
            verification_status: 'verified'
          })
          .select('id')
          .single();

        storeId = newStore?.id;
      }
    }

    // 4. Client Sign In to obtain real JWT
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: config.email,
      password: config.password
    });

    return NextResponse.json({
      success: true,
      token: signInData?.session?.access_token || `token_${authUser.id}_${Date.now()}`,
      session: signInData?.session || null,
      user: {
        id: authUser.id,
        email: config.email,
        full_name: config.fullName,
        phone_number: config.phone,
        role: config.role,
        store_id: storeId
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
