import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ynfglaxkvocijjnrgobl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_x-SvK9HTsLOvOUQ2TddE6g_oD5MxLHl';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

export const supabaseUrl = (rawUrl && rawUrl.trim().startsWith('http'))
  ? rawUrl.trim()
  : DEFAULT_SUPABASE_URL;

export const supabaseAnonKey = (rawAnonKey && rawAnonKey.trim().length > 0)
  ? rawAnonKey.trim()
  : DEFAULT_SUPABASE_ANON_KEY;

export const supabaseServiceKey = (rawServiceKey && rawServiceKey.trim().length > 0)
  ? rawServiceKey.trim()
  : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

