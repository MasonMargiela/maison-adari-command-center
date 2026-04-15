import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append('client_id', process.env.INSTAGRAM_APP_ID!);
  params.append('client_secret', process.env.INSTAGRAM_APP_SECRET!);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI!);
  params.append('code', code);

  const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: params,
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error_type) {
    return NextResponse.json({ error: tokenData.error_message, raw: tokenData }, { status: 400 });
  }

  const shortToken = tokenData.access_token;
  const userId = tokenData.user_id;

  const longTokenRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortToken}`
  );
  const longTokenData = await longTokenRes.json();
  const finalToken = longTokenData.access_token || shortToken;

  return NextResponse.json({
    ok: true,
    access_token: finalToken,
    user_id: userId,
    expires_in: longTokenData.expires_in,
    message: 'Copy this access_token and add it as INSTAGRAM_ACCESS_TOKEN in Vercel env vars',
  });
}
