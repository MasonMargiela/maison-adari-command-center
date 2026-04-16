import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message');

  if (error || errorCode) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://project-3tj6u.vercel.app';
    return NextResponse.redirect(`${baseUrl}/connect?ig_error=${encodeURIComponent(errorMessage ?? error ?? 'unknown')}`);
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;
  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error.message, raw: tokenData }, { status: 400 });
  }

  const fbToken = tokenData.access_token;

  const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${fbToken}`);
  const pagesData = await pagesRes.json();

  let igAccountId = null;
  let finalToken = fbToken;

  if (pagesData.data && pagesData.data.length > 0) {
    const pageToken = pagesData.data[0].access_token;
    const pageId = pagesData.data[0].id;
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
    const igData = await igRes.json();
    igAccountId = igData.instagram_business_account?.id;
    finalToken = pageToken;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://project-3tj6u.vercel.app';

  return NextResponse.json({
    ok: true,
    message: 'Instagram connected. Add these to Vercel env vars then redeploy.',
    access_token: finalToken,
    ig_account_id: igAccountId,
    pages: pagesData.data?.map((p: any) => ({ id: p.id, name: p.name })),
  });
}
