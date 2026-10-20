import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SUPABASE_STORE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'Store';

function extractStoragePath(urlOrPath?: string, bucket: string = SUPABASE_STORE_BUCKET): string | null {
  if (!urlOrPath) return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/^\/+/, '');
  }
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    const rawPath = trimmed.substring(idx + marker.length);
    return decodeURIComponent(rawPath.split('?')[0]);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const existingUrl = (formData.get('existingUrl') as string) || '';
    const customName = (formData.get('customName') as string) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const oldPath = extractStoragePath(existingUrl, SUPABASE_STORE_BUCKET);

    let targetPath = '';

    if (customName && customName.trim().length > 0) {
      // Deterministic path: replaces in-place for this entity
      const cleanCustom = customName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      targetPath = `${folder}/${cleanCustom}.${fileExt}`;
    } else if (oldPath && oldPath.startsWith(`${folder}/`)) {
      // Reuse existing path so it replaces in-place without generating a new file
      const baseName = oldPath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'image';
      targetPath = `${folder}/${baseName}.${fileExt}`;
    } else {
      // Clean unique path
      const cleanFileName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .toLowerCase()
        .substring(0, 24);
      targetPath = `${folder}/${cleanFileName}_${Date.now()}.${fileExt}`;
    }

    // If an older file existed under a different path or extension, remove it to prevent storage clutter
    if (oldPath && oldPath !== targetPath) {
      try {
        await supabaseAdmin.storage.from(SUPABASE_STORE_BUCKET).remove([oldPath]);
        console.log(`[Next.js /api/upload] Cleaned up replaced file '${oldPath}'`);
      } catch (removeErr) {
        console.warn(`[Next.js /api/upload] Notice removing replaced file '${oldPath}':`, removeErr);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload / Replace with upsert: true
    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_STORE_BUCKET)
      .upload(targetPath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Next.js /api/upload] Supabase Storage upload error:', error.message);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(SUPABASE_STORE_BUCKET)
      .getPublicUrl(targetPath);

    const basePublicUrl =
      publicData?.publicUrl ||
      `https://ynfglaxkvocijjnrgobl.supabase.co/storage/v1/object/public/${SUPABASE_STORE_BUCKET}/${targetPath}`;

    // Append timestamp query parameter to bust browser cache immediately upon image replacement
    const finalUrl = `${basePublicUrl}?t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      path: targetPath,
      replaced: !!oldPath,
    });
  } catch (err: any) {
    console.error('[Next.js /api/upload Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal upload error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlOrPath = searchParams.get('url') || searchParams.get('path');

    if (!urlOrPath) {
      return NextResponse.json(
        { success: false, error: 'File path or URL is required' },
        { status: 400 }
      );
    }

    const storagePath = extractStoragePath(urlOrPath, SUPABASE_STORE_BUCKET);
    if (!storagePath) {
      return NextResponse.json({
        success: true,
        message: 'No Supabase storage file to delete (local or already removed)',
      });
    }

    const { error } = await supabaseAdmin.storage
      .from(SUPABASE_STORE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.warn(`[Next.js /api/upload DELETE] Supabase remove warning for '${storagePath}':`, error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.log(`[Next.js /api/upload DELETE] Synchronously deleted image '${storagePath}' from bucket '${SUPABASE_STORE_BUCKET}'`);
    return NextResponse.json({
      success: true,
      deletedPath: storagePath,
    });
  } catch (err: any) {
    console.error('[Next.js /api/upload DELETE Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'banners';
    const { data: files, error } = await supabaseAdmin.storage.from(SUPABASE_STORE_BUCKET).list(folder);
    const { data: buckets, error: bError } = await supabaseAdmin.storage.listBuckets();
    return NextResponse.json({ success: true, folder, files, buckets, error, bError });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
