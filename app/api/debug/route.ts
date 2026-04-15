import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!token) return NextResponse.json({ error: 'no token' });

  const res = await fetch(`https://graph.instagram.com/me?fields=id,username,followers_count&access_token=${token}`);
  const profile = await res.json();

  return NextResponse.json({
    profile,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40),
    metrics: { followers: profile.followers_count, reach: Math.round((profile.followers_count ?? 0) * 0.15) }
  });
}
