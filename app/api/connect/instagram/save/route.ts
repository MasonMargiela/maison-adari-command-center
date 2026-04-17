import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { ig_id, username } = await request.json();

  if (!ig_id || !username) {
    return NextResponse.json({ error: 'Missing ig_id or username' }, { status: 400 });
  }

  // Get token from cookie
  const tokensCookie = request.cookies.get('ig_tokens')?.value;
  if (!tokensCookie) {
    return NextResponse.json({ error: 'Session expired. Please reconnect Instagram.' }, { status: 401 });
  }

  let tokens: Record<string, string> = {};
  try {
    tokens = JSON.parse(decodeURIComponent(tokensCookie));
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const token = tokens[ig_id];
  if (!token) {
    return NextResponse.json({ error: 'Token not found for this account' }, { status: 400 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supaUrl || !supaKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supaUrl, supaKey);

  const { data, error } = await supabase
    .from('connected_accounts')
    .upsert({
      platform: 'instagram',
      platform_user_id: ig_id,
      username,
      display_name: username,
      access_token: token,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform,platform_user_id' })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id, username });
}
