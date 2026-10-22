import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const logs: string[] = [];

  try {
    // 1. Delete all files from all storage buckets
    logs.push('--- Cleaning Storage Buckets ---');
    const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
    if (bErr) {
      logs.push(`List buckets error: ${bErr.message}`);
    } else {
      logs.push(`Found ${buckets?.length || 0} buckets: ${buckets?.map((b) => b.name).join(', ')}`);
      for (const bucket of buckets || []) {
        try {
          const { data: files, error: fErr } = await supabaseAdmin.storage.from(bucket.name).list('', {
            limit: 1000,
            offset: 0
          });
          if (fErr) {
            logs.push(`Error listing bucket ${bucket.name}: ${fErr.message}`);
          } else if (files && files.length > 0) {
            const filePaths = files.map((f) => f.name);
            const { error: delErr } = await supabaseAdmin.storage.from(bucket.name).remove(filePaths);
            if (delErr) {
              logs.push(`Error removing files from ${bucket.name}: ${delErr.message}`);
            } else {
              logs.push(`Successfully removed ${filePaths.length} files from bucket '${bucket.name}'`);
            }
          } else {
            logs.push(`Bucket '${bucket.name}' is already empty`);
          }
        } catch (bucketErr: any) {
          logs.push(`Bucket '${bucket.name}' processing error: ${bucketErr.message}`);
        }
      }
    }

    // 2. Delete all records from all database tables
    logs.push('--- Cleaning Database Tables ---');
    const tables = [
      'enquiry_responses',
      'enquiries',
      'messages',
      'conversations',
      'announcements_and_offers',
      'offers',
      'products',
      'stores',
      'users'
    ];

    for (const table of tables) {
      try {
        const { error, count } = await supabaseAdmin
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

        if (error) {
          logs.push(`Table '${table}': delete error (${error.message})`);
        } else {
          logs.push(`Table '${table}': all rows deleted successfully`);
        }
      } catch (tableErr: any) {
        logs.push(`Table '${table}': exception (${tableErr.message})`);
      }
    }

    // 3. Clear auth.users if any exist (except superadmin)
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      if (authData?.users && authData.users.length > 0) {
        for (const u of authData.users) {
          if (u.email?.toLowerCase() !== 'parthchauhan417418@gmail.com') {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
            logs.push(`Deleted auth user: ${u.email || u.id}`);
          }
        }
      }
    } catch (authErr: any) {
      logs.push(`Auth cleanup note: ${authErr.message}`);
    }

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, logs }, { status: 500 });
  }
}
