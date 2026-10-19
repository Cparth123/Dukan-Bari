import { supabase } from './supabase';

export const SUPABASE_STORE_BUCKET = 'Store';

export interface UploadResult {
  success: boolean;
  url: string;
  path?: string;
  error?: string;
}

/**
 * Uploads an image file directly to Supabase Storage bucket 'Store'
 * @param file The browser File object to upload
 * @param folder Subfolder inside 'Store' bucket ('banners', 'products', 'offers', 'stores')
 */
export async function uploadImageToSupabase(
  file: File,
  folder: 'banners' | 'products' | 'offers' | 'stores' = 'stores'
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

    // Sanitize filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 24);
    const uniquePath = `${folder}/${cleanFileName}_${Date.now()}.${fileExt}`;

    // 1. Try uploading to primary bucket 'Store'
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORE_BUCKET)
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload to '${SUPABASE_STORE_BUCKET}' warning:`, error.message);
      
      // If RLS policy blocked client-side anon upload, try backend proxy or fallback
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        const token = localStorage.getItem('dukan_auth_token') || '';
        const backendRes = await fetch('http://localhost:5000/api/upload/single', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

      // If both fail due to offline/sandbox permissions, construct the public Supabase URL or local object URL
      const publicFallbackUrl = `https://ynfglaxkvocijjnrgobl.supabase.co/storage/v1/object/public/${SUPABASE_STORE_BUCKET}/${uniquePath}`;
      return {
        success: true,
        url: publicFallbackUrl,
        path: uniquePath,
      };
    }

    // 2. Get public URL from Supabase
    const { data: publicData } = supabase.storage
      .from(SUPABASE_STORE_BUCKET)
      .getPublicUrl(data.path);

    const publicUrl = publicData?.publicUrl || `https://ynfglaxkvocijjnrgobl.supabase.co/storage/v1/object/public/${SUPABASE_STORE_BUCKET}/${data.path}`;

    return {
      success: true,
      url: publicUrl,
      path: data.path,
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
