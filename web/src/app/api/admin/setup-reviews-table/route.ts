import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/admin/setup-reviews-table
 * Creates the store_reviews table in Supabase if it doesn't exist.
 * Run this ONCE to set up the schema.
 */
export async function GET() {
  try {
    // Try creating the table using raw SQL via RPC
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Remove deprecated Reverse Enquiry tables
        DROP TABLE IF EXISTS public.enquiry_responses CASCADE;
        DROP TABLE IF EXISTS public.enquiries CASCADE;

        CREATE TABLE IF NOT EXISTS public.store_reviews (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
          user_id uuid NOT NULL,
          user_name text NOT NULL DEFAULT 'Customer',
          rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment text DEFAULT '',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(store_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON public.store_reviews(store_id);
        ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow all reads" ON public.store_reviews;
        CREATE POLICY "Allow all reads" ON public.store_reviews FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.store_reviews;
        CREATE POLICY "Allow authenticated inserts" ON public.store_reviews FOR INSERT WITH CHECK (true);
        DROP POLICY IF EXISTS "Allow authenticated updates" ON public.store_reviews;
        CREATE POLICY "Allow authenticated updates" ON public.store_reviews FOR UPDATE USING (true);
      `
    });

    if (error) {
      // exec_sql RPC may not exist; provide SQL for manual execution
      console.warn('[setup-reviews-table] RPC error:', error.message);
      return NextResponse.json({
        success: false,
        note: 'Please run this SQL in Supabase SQL Editor:',
        sql: `
-- Remove deprecated Reverse Enquiry tables
DROP TABLE IF EXISTS public.enquiry_responses CASCADE;
DROP TABLE IF EXISTS public.enquiries CASCADE;

-- Create Store Reviews table
CREATE TABLE IF NOT EXISTS public.store_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT 'Customer',
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON public.store_reviews(store_id);
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all reads" ON public.store_reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated inserts" ON public.store_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated updates" ON public.store_reviews FOR UPDATE USING (true);
        `
      });
    }

    return NextResponse.json({ success: true, message: 'store_reviews table created successfully!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
