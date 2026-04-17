import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { ig_id, username, token: bodyToken } = await request.json();

  if (!ig_id || !username) {
    return NextResponse.json({ error: 'Missing ig_id or username' }, { status: 400 });
  }

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supaUrl || !supaKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supaUrl, supaKey);

  // Get token from cookie or body
  let token = bodyToken;
  if (!token) {
    const tokensCookie = request.cookies.get('ig_tokens')?.value;
    if (tokensCookie) {
      try {
        const tokens = JSON.parse(decodeURIComponent(tokensCookie));
        token = tokens[ig_id];
      } catch {}
    }
  }

  // Check if account already exists
  const { data: existing } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('platform', 'instagram')
    .eq('username', username)
    .maybeSingle();

  let result;
  if (existing?.id) {
    // Update existing
    result = await supabase
      .from('connected_accounts')
      .update({
        platform_user_id: ig_id,
        display_name: username,
        ...(token && { access_token: token }),
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id')
      .single();
  } else {
    // Insert new
    result = await supabase
      .from('connected_accounts')
      .insert({
        platform: 'instagram',
        platform_user_id: ig_id,
        username,
        display_name: username,
        ...(token && { access_token: token }),
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: result.data?.id, username });
}

export async function DELETE(request: NextRequest) {
  const { platform, handle } = await request.json();
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  const supabase = createClient(supaUrl, supaKey);
  await supabase.from('connected_accounts').update({ is_active: false }).eq('platform', platform).eq('username', handle.replace('@', ''));
  return NextResponse.json({ ok: true });
}
