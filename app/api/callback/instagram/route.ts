import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://project-3tj6u.vercel.app';

  if (error || errorCode) {
    return NextResponse.redirect(
      `${baseUrl}/connect?ig_error=${encodeURIComponent(errorMessage ?? error ?? 'unknown')}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/connect?ig_error=no_code`);
  }

  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;
  const appId = process.env.INSTAGRAM_APP_ID!;
  const appSecret = process.env.INSTAGRAM_APP_SECRET!;

  // Exchange code for FB token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return NextResponse.redirect(
      `${baseUrl}/connect?ig_error=${encodeURIComponent(tokenData.error.message)}`
    );
  }

  const fbToken = tokenData.access_token;

  // Get all Facebook pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${fbToken}`
  );
  const pagesData = await pagesRes.json();

  // For each page, get connected Instagram account details
  const accounts: any[] = [];

  if (pagesData.data && pagesData.data.length > 0) {
    for (const page of pagesData.data) {
      if (page.instagram_business_account) {
        const igId = page.instagram_business_account.id;
        const igRes = await fetch(
          `https://graph.facebook.com/v19.0/${igId}?fields=id,username,followers_count,profile_picture_url&access_token=${page.access_token}`
        );
        const igData = await igRes.json();

        if (igData.username) {
          accounts.push({
            ig_id: igId,
            username: igData.username,
            followers: igData.followers_count ?? 0,
            picture: igData.profile_picture_url ?? '',
            page_name: page.name,
            page_id: page.id,
            token: page.access_token,
          });
        }
      }
    }
  }

  if (accounts.length === 0) {
    return NextResponse.redirect(
      `${baseUrl}/connect?ig_error=${encodeURIComponent('No Instagram business accounts found. Make sure your Instagram is connected to a Facebook Page as a Business or Creator account.')}`
    );
  }

  // If only one account, auto-connect it
  if (accounts.length === 1) {
    const acc = accounts[0];
    // Save token to Supabase
    await saveAccount(acc, request.cookies.get('invite_client_id')?.value ?? null);
    return NextResponse.redirect(`${baseUrl}/connect?ig_success=${acc.username}`);
  }

  // Multiple accounts — redirect to selector
  const accountsParam = encodeURIComponent(JSON.stringify(accounts.map(a => ({
    ig_id: a.ig_id,
    username: a.username,
    followers: a.followers,
    picture: a.picture,
    page_name: a.page_name,
  }))));

  // Store tokens temporarily in a cookie (30 min)
  const tokensParam = encodeURIComponent(JSON.stringify(
    accounts.reduce((acc: any, a: any) => { acc[a.ig_id] = a.token; return acc; }, {})
  ));

  const response = NextResponse.redirect(`${baseUrl}/connect/select?accounts=${accountsParam}`);
  response.cookies.set('ig_tokens', tokensParam, { maxAge: 1800, httpOnly: true, secure: true });
  return response;
}

async function saveAccount(acc: any, clientId?: string | null) {
  try {
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supaUrl || !supaKey) return;

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supaUrl, supaKey);

    await supabase.from('connected_accounts').upsert({
      platform: 'instagram',
      platform_user_id: acc.ig_id,
      username: acc.username,
      display_name: acc.username,
      access_token: acc.token,
      is_active: true,
      client_id: clientId ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform,platform_user_id' });
  } catch (e) {
    console.error('Save account error:', e);
  }
}
