import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// This route refreshes all Instagram long-lived tokens before they expire
// Instagram tokens last 60 days — refresh weekly to keep them fresh forever
// Call this via cron or manually at: /api/cron/refresh-token

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supaUrl || !supaKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supaUrl, supaKey);

  // Get all active Instagram accounts with tokens
  const { data: accounts, error } = await supabase
    .from('connected_accounts')
    .select('id, username, platform, access_token, token_expires_at, updated_at')
    .eq('is_active', true)
    .not('access_token', 'is', null);

  if (error || !accounts) {
    return NextResponse.json({ error: 'Failed to fetch accounts', details: error }, { status: 500 });
  }

  const results: any[] = [];

  for (const account of accounts) {
    try {
      if (account.platform === 'instagram') {
        const refreshResult = await refreshInstagramToken(account, supabase);
        results.push(refreshResult);
      } else if (account.platform === 'tiktok') {
        const refreshResult = await refreshTikTokToken(account, supabase);
        results.push(refreshResult);
      }
    } catch (err: any) {
      results.push({
        id: account.id,
        username: account.username,
        platform: account.platform,
        status: 'error',
        error: err.message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    refreshed: results.filter(r => r.status === 'refreshed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    failed: results.filter(r => r.status === 'error').length,
    results,
    timestamp: new Date().toISOString(),
  });
}

async function refreshInstagramToken(account: any, supabase: any) {
  const token = account.access_token;
  if (!token) {
    return { id: account.id, username: account.username, platform: 'instagram', status: 'skipped', reason: 'no token' };
  }

  // Check if token needs refresh — refresh if expires within 30 days or no expiry recorded
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at) : null;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  if (expiresAt && expiresAt > thirtyDaysFromNow) {
    return { 
      id: account.id, 
      username: account.username, 
      platform: 'instagram', 
      status: 'skipped', 
      reason: `token valid until ${expiresAt.toDateString()}` 
    };
  }

  // Refresh the Instagram long-lived token
  // Instagram long-lived tokens can be refreshed as long as they haven't expired
  const refreshRes = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  );
  const refreshData = await refreshRes.json();

  if (refreshData.error) {
    // Try Facebook Graph API refresh instead
    const fbRefreshRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_APP_ID}&client_secret=${process.env.INSTAGRAM_APP_SECRET}&fb_exchange_token=${token}`
    );
    const fbRefreshData = await fbRefreshRes.json();

    if (fbRefreshData.error) {
      return {
        id: account.id,
        username: account.username,
        platform: 'instagram',
        status: 'error',
        error: refreshData.error.message ?? 'Refresh failed',
        action: 'User needs to reconnect via /connect',
      };
    }

    const newToken = fbRefreshData.access_token;
    const newExpiry = new Date(Date.now() + (fbRefreshData.expires_in ?? 5184000) * 1000);

    await supabase.from('connected_accounts').update({
      access_token: newToken,
      token_expires_at: newExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', account.id);

    return { id: account.id, username: account.username, platform: 'instagram', status: 'refreshed', expires: newExpiry.toDateString() };
  }

  const newToken = refreshData.access_token;
  const newExpiry = new Date(Date.now() + (refreshData.expires_in ?? 5184000) * 1000);

  await supabase.from('connected_accounts').update({
    access_token: newToken,
    token_expires_at: newExpiry.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', account.id);

  // Also update the env var fallback token if this is Mason's account
  if (account.username === 'masondoesnumbers') {
    // Log new token so Mason can update Vercel env var if needed
    console.log(`Mason's Instagram token refreshed. Update INSTAGRAM_ACCESS_TOKEN in Vercel if sync stops working.`);
  }

  return {
    id: account.id,
    username: account.username,
    platform: 'instagram',
    status: 'refreshed',
    expires: newExpiry.toDateString(),
  };
}

async function refreshTikTokToken(account: any, supabase: any) {
  const token = account.access_token;
  if (!token) {
    return { id: account.id, username: account.username, platform: 'tiktok', status: 'skipped', reason: 'no token' };
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return { id: account.id, username: account.username, platform: 'tiktok', status: 'skipped', reason: 'missing TikTok credentials' };
  }

  // TikTok access tokens expire in 24 hours — need refresh token
  // For now check if we have a refresh token stored
  const { data: fullAccount } = await supabase
    .from('connected_accounts')
    .select('refresh_token')
    .eq('id', account.id)
    .single();

  if (!fullAccount?.refresh_token) {
    return { id: account.id, username: account.username, platform: 'tiktok', status: 'skipped', reason: 'no refresh token — user needs to reconnect' };
  }

  const refreshRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: fullAccount.refresh_token,
    }),
  });

  const refreshData = await refreshRes.json();

  if (refreshData.error) {
    return {
      id: account.id,
      username: account.username,
      platform: 'tiktok',
      status: 'error',
      error: refreshData.error_description ?? 'Refresh failed',
      action: 'User needs to reconnect via /connect/invite',
    };
  }

  const newExpiry = new Date(Date.now() + (refreshData.expires_in ?? 86400) * 1000);

  await supabase.from('connected_accounts').update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token ?? fullAccount.refresh_token,
    token_expires_at: newExpiry.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', account.id);

  return {
    id: account.id,
    username: account.username,
    platform: 'tiktok',
    status: 'refreshed',
    expires: newExpiry.toDateString(),
  };
}
