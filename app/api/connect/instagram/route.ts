import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing Instagram credentials' }, { status: 500 });
  }

  const url = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;

  return NextResponse.redirect(url);
}
