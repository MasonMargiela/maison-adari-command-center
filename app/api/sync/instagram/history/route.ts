import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') ?? '30');
  const accountIdParam = searchParams.get('accountId');

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supaUrl || !supaKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supaUrl, supaKey);

  let accountId: string | null = null;

  if (accountIdParam) {
    accountId = accountIdParam;
  } else {
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .limit(1)
      .single();
    accountId = account?.id ?? null;
  }

  if (!accountId) {
    return NextResponse.json({ history: [] });
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: snapshots } = await supabase
    .from('metric_snapshots')
    .select('metric_value, recorded_at')
    .eq('connected_account_id', accountId)
    .eq('metric_type', 'followers_count')
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true });

  if (!snapshots || snapshots.length === 0) {
    return NextResponse.json({ history: [] });
  }

  const byDay: Record<string, number> = {};
  for (const snap of snapshots) {
    const day = snap.recorded_at.substring(0, 10);
    const val = parseInt(snap.metric_value);
    if (!byDay[day] || val > byDay[day]) {
      byDay[day] = val;
    }
  }

  const dates = Object.keys(byDay).sort();
  const history = dates.map((date, i) => {
    const followers = byDay[date];
    const prev = i > 0 ? byDay[dates[i - 1]] : followers;
    return { date, followers, delta: followers - prev };
  });

  return NextResponse.json({ history, account_id: accountId });
}
