import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igId = '26996583109933368';

  if (!token) return NextResponse.json({ error: 'No token' });

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igId}/insights?metric=follower_demographics&period=lifetime&breakdown=country&metric_type=total_value&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
