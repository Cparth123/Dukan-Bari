import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.SUPERADMIN_EMAIL || 'parthchauhan417418@gmail.com';
    const expectedPassword = process.env.SUPERADMIN_PASSWORD || 'parth123@';

    const cleanInputEmail = (email || '').trim().toLowerCase();
    const cleanExpectedEmail = expectedEmail.trim().toLowerCase();

    if (cleanInputEmail === cleanExpectedEmail && password === expectedPassword) {
      const sessionPayload = {
        id: 'superadmin_parth_root',
        email: expectedEmail,
        full_name: 'Parth Chauhan (Superadmin)',
        role: 'superadmin',
        role_label: 'Platform Superadmin',
        token: `admin_token_${Buffer.from(`${expectedEmail}:${Date.now()}`).toString('base64')}`,
        expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      };

      return NextResponse.json({
        success: true,
        user: sessionPayload,
        token: sessionPayload.token,
        role: 'superadmin'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid Superadmin credentials. Unauthorized access prohibited.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
