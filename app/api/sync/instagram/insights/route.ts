import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Read token from Supabase — always fresh via weekly cron
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('access_token, platform_user_id')
    .eq('platform', 'instagram')
    .eq('is_active', true)
    .not('access_token', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (!account?.access_token) {
    return NextResponse.json({ error: 'No active Instagram account' });
  }

  const igId = account.platform_user_id || '26996583109933368';
  const token = account.access_token;

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${igId}/insights?metric=follower_demographics&period=lifetime&breakdown=country&metric_type=total_value&access_token=${token}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}
