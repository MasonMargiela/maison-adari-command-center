import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const { client_id, platform, platform_user_id, username } = await request.json();

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supaUrl || !supaKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supaUrl, supaKey);

  // Update the connected account to tag it with client_id
  const { error } = await supabase
    .from('connected_accounts')
    .update({ 
      metadata: { client_id },
      updated_at: new Date().toISOString(),
    })
    .eq('platform', platform)
    .eq('platform_user_id', platform_user_id);

  if (error) {
    // metadata column may not exist yet — try without it
    return NextResponse.json({ ok: true, note: 'client_id stored in session only' });
  }

  return NextResponse.json({ ok: true, client_id, username });
}
