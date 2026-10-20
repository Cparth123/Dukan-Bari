import { supabase } from './supabase';

export const SUPABASE_STORE_BUCKET = 'Store';

export interface UploadResult {
  success: boolean;
  url: string;
  path?: string;
  error?: string;
}

/**
 * Extracts the storage relative path (e.g. 'products/item_123.jpg') from a full public Supabase URL or relative string.
 * Automatically ignores static local images (e.g. '/grocery-product.jpg', '/barber-service.jpg').
 */
export function extractStoragePath(urlOrPath?: string, bucket: string = SUPABASE_STORE_BUCKET): string | null {
  if (!urlOrPath) return null;
  const trimmed = urlOrPath.trim();

  // If it's a local static asset bundled in Next.js public/ folder, never attempt to delete it
  if (trimmed.startsWith('/') && !trimmed.includes('/storage/')) {
    return null;
  }

  // If it is a full public Supabase URL
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = trimmed.indexOf(marker);
  if (idx !== -1) {
    const rawPath = trimmed.substring(idx + marker.length);
    return decodeURIComponent(rawPath.split('?')[0]);
  }

  // If it is already a relative path like 'products/image.jpg' or 'banners/store_banner.jpg'
  if (
    trimmed.startsWith('products/') ||
    trimmed.startsWith('banners/') ||
    trimmed.startsWith('offers/') ||
    trimmed.startsWith('stores/')
  ) {
    return decodeURIComponent(trimmed.split('?')[0]);
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/^\/+/, '').split('?')[0];
  }

  return null;
}

/**
 * Deletes an image directly from the Supabase Storage bucket 'Store' via server-side API
 */
export async function deleteStorageFile(urlOrPath: string): Promise<boolean> {
  try {
    const storagePath = extractStoragePath(urlOrPath, SUPABASE_STORE_BUCKET);
    if (!storagePath) {
      // Local static image or invalid path, nothing to delete from bucket
      return true;
    }

    const res = await fetch(`/api/upload?path=${encodeURIComponent(storagePath)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      const json = await res.json();
      return !!json.success;
    }
    return false;
  } catch (err) {
    console.warn('[deleteStorageFile warning]:', err);
    return false;
  }
}

/**
 * Uploads an image file directly to Supabase Storage bucket 'Store'
 * @param file The browser File object to upload
 * @param folder Subfolder inside 'Store' bucket ('banners', 'products', 'offers', 'stores')
 */
export async function uploadImageToSupabase(
  file: File,
  folder: 'banners' | 'products' | 'offers' | 'stores' = 'stores',
  options?: {
    existingUrl?: string;
    customName?: string;
  }
): Promise<UploadResult> {
  try {
    if (!file) {
      return { success: false, url: '', error: 'No file provided' };
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return { success: false, url: '', error: 'Only JPG, PNG, WEBP, and GIF images are supported' };
    }

    const existingUrl = options?.existingUrl || '';
    const customName = options?.customName || '';

    // 1. Primary: Upload via server-side Next.js route (uses supabaseAdmin service role to bypass RLS & replaces in-place)
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      if (existingUrl) formData.append('existingUrl', existingUrl);
      if (customName) formData.append('customName', customName);

      const serverRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json.success && json.url) {
          return {
            success: true,
            url: json.url,
            path: json.path,
          };
        } else if (json.error) {
          console.warn('[Next.js Upload Response Error]:', json.error);
        }
      }
    } catch (serverErr) {
      console.warn('[Next.js Upload Notice]:', serverErr);
    }

    // 2. Secondary: Fallback to backend Express server on port 5000
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      if (existingUrl) formData.append('existingUrl', existingUrl);
      if (customName) formData.append('customName', customName);

      let token = '';
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token || '';
      } catch { }
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('dukan_auth_token') || 'token_client_upload';
      }

      const headers: Record<string, string> = {};
      if (token && token.trim().length > 0) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const backendRes = await fetch('http://localhost:5000/api/upload/single', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (backendRes.ok) {
        const json = await backendRes.json();
        if (json.data?.url) {
          return {
            success: true,
            url: json.data.url,
            path: json.data.filePath,
          };
        }
      }
    } catch (backendErr) {
      console.warn('[Backend Upload Fallback]:', backendErr);
    }

    return {
      success: false,
      url: '',
      error: 'Failed to upload image. Please check network connection and try again.',
    };
  } catch (err: any) {
    console.error('[Storage Error]:', err);
    return {
      success: false,
      url: '',
      error: err.message || 'Failed to upload image',
    };
  }
}
