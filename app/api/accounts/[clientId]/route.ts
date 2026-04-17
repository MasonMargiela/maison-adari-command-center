import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await context.params;

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supaUrl || !supaKey) return NextResponse.json({ accounts: [] });

  const supabase = createClient(supaUrl, supaKey);

  const { data: accounts, error } = await supabase
    .from('connected_accounts')
    .select('id, platform, username, display_name, is_active, client_id, updated_at')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('platform', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ accounts: [], error: error.message });

  const seen = new Set<string>();
  const deduped = (accounts ?? []).filter(acc => {
    const key = `${acc.platform}:${acc.username}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ accounts: deduped, client_id: clientId });
}
