import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('id, access_token, platform_user_id')
    .eq('platform', 'instagram')
    .eq('username', 'masondoesnumbers')
    .eq('is_active', true)
    .single();

  if (!account?.access_token) {
    return NextResponse.json({ error: 'No active Instagram account' });
  }

  const token = account.access_token;
  const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  const until = Math.floor(Date.now() / 1000);

  // Get daily deltas from Instagram API
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${account.platform_user_id}/insights?metric=follower_count&period=day&since=${since}&until=${until}&access_token=${token}`
  );
  const data = await res.json();
  const dailyDeltas = data.data?.[0]?.values ?? [];

  // Get current real follower count
  const profileRes = await fetch(
    `https://graph.instagram.com/me?fields=followers_count&access_token=${token}`
  );
  const profile = await profileRes.json();
  const currentFollowers = profile.followers_count ?? 369;

  // Work backwards from current count using real daily deltas
  // Sum all deltas to find starting point
  const totalDeltaGain = dailyDeltas.reduce((sum: number, v: any) => sum + (v.value ?? 0), 0);
  const startingFollowers = currentFollowers - totalDeltaGain;

  // Build cumulative follower counts
  let runningTotal = startingFollowers;
  const dailyCounts: { date: string; followers: number }[] = [];

  for (const v of dailyDeltas) {
    runningTotal += v.value ?? 0;
    dailyCounts.push({
      date: new Date(v.end_time).toISOString().split('T')[0],
      followers: Math.max(runningTotal, startingFollowers),
    });
  }

  // Delete old bad snapshots and reinsert correct ones
  await supabase
    .from('metric_snapshots')
    .delete()
    .eq('connected_account_id', account.id)
    .eq('metric_type', 'followers_count')
    .lt('recorded_at', '2026-04-16T00:00:00Z');

  let inserted = 0;
  for (const day of dailyCounts) {
    if (!day.date || day.date >= '2026-04-16') continue;
    await supabase.from('metric_snapshots').insert({
      connected_account_id: account.id,
      platform: 'instagram',
      metric_type: 'followers_count',
      metric_value: day.followers,
      recorded_at: day.date + 'T12:00:00Z',
    });
    inserted++;
  }

  return NextResponse.json({
    ok: true,
    inserted,
    current_followers: currentFollowers,
    starting_followers: startingFollowers,
    total_gain_30d: totalDeltaGain,
    sample: dailyCounts.slice(0, 5),
  });
}
