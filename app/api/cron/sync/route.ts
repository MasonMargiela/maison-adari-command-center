import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://project-3tj6u.vercel.app';
  const results: any = {};

  try {
    const igRes = await fetch(`${baseUrl}/api/sync/instagram`);
    results.instagram = await igRes.json();
    results.instagram_ok = !results.instagram.error;
  } catch (err) {
    results.instagram_error = String(err);
  }

  return NextResponse.json({
    ok: true,
    synced_at: new Date().toISOString(),
    results,
  });
}
