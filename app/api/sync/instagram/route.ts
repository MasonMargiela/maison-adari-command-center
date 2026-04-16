import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 500 });
  }

  try {
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count,profile_picture_url,biography,website&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return NextResponse.json({ error: profile.error.message }, { status: 200 });
    }

    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink&limit=20&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    const media = mediaData.data ?? [];

    const followers = profile.followers_count ?? 0;
    const following = profile.follows_count ?? 0;
    const mediaCount = profile.media_count ?? 0;
    const handle = '@' + profile.username;

    // Real engagement
    let engagementRate = 0;
    let avgLikes = 0;
    let avgComments = 0;
    if (media.length > 0 && followers > 0) {
      const totalLikes = media.reduce((s: number, p: any) => s + (p.like_count ?? 0), 0);
      const totalComments = media.reduce((s: number, p: any) => s + (p.comments_count ?? 0), 0);
      avgLikes = Math.round(totalLikes / media.length);
      avgComments = Math.round(totalComments / media.length);
      engagementRate = parseFloat(((((totalLikes + totalComments) / media.length) / followers) * 100).toFixed(2));
    }

    // Reach estimate
    const reachRaw = media.length > 0
      ? Math.round((followers * 0.15) + (avgLikes * 2.5))
      : Math.round(followers * 0.15);
    const reach = reachRaw >= 1000 ? (reachRaw / 1000).toFixed(1) + 'K' : String(reachRaw);

    // Content score
    const engScore = Math.min(40, (engagementRate / 10) * 40);
    const postScore = Math.min(30, (Math.min(mediaCount, 10) / 10) * 30);
    const contentScore = Math.round(engScore + postScore);

    // Supabase — non-blocking
    let monthlyGrowthRate = 0;
    let weeklyGrowthRate = 0;
    let savedToSupabase = false;
    let snapshotCount = 0;

    try {
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supaUrl && supaKey && supaUrl.includes('supabase.co')) {
        const supabase = createClient(supaUrl, supaKey);

        const { data: accountData, error: upsertError } = await supabase
          .from('connected_accounts')
          .upsert({
            platform: 'instagram',
            platform_user_id: profile.id,
            username: profile.username,
            display_name: profile.username,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'platform,platform_user_id' })
          .select('id')
          .single();

        if (!upsertError && accountData?.id) {
          savedToSupabase = true;
          const accountId = accountData.id;

          // Only insert once per hour to avoid duplicate snapshots
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { data: recentSnap } = await supabase
            .from('metric_snapshots')
            .select('id')
            .eq('connected_account_id', accountId)
            .eq('metric_type', 'followers_count')
            .gte('recorded_at', oneHourAgo)
            .limit(1);

          if (!recentSnap || recentSnap.length === 0) {
            await supabase.from('metric_snapshots').insert([
              { connected_account_id: accountId, platform: 'instagram', metric_type: 'followers_count', metric_value: followers },
              { connected_account_id: accountId, platform: 'instagram', metric_type: 'engagement_rate', metric_value: engagementRate },
            ]);
          }

          // Pull full history for pace calculation
          const { data: snapshots } = await supabase
            .from('metric_snapshots')
            .select('metric_value, recorded_at')
            .eq('connected_account_id', accountId)
            .eq('metric_type', 'followers_count')
            .order('recorded_at', { ascending: true });

          if (snapshots && snapshots.length >= 2) {
            snapshotCount = snapshots.length;
            const newest = Number(snapshots[snapshots.length - 1].metric_value);
            const oldest = Number(snapshots[0].metric_value);
            const daysDiff = (
              new Date(snapshots[snapshots.length - 1].recorded_at).getTime() -
              new Date(snapshots[0].recorded_at).getTime()
            ) / (1000 * 60 * 60 * 24);

            if (daysDiff > 0) {
              const dailyRate = (newest - oldest) / daysDiff;
              monthlyGrowthRate = Math.round(dailyRate * 30);
              weeklyGrowthRate = Math.round(dailyRate * 7);
            }
          }
        }
      }
    } catch (dbErr: any) {
      console.error('Supabase error:', dbErr.message);
    }

    // Pace and ETA logic
    // If no history yet, use a conservative industry estimate based on account size
    // Small accounts (< 1K): avg 2-5% monthly growth
    // We use the lower bound as a honest fallback
    let pace = 'Estimating...';
    let paceMonthly = 0;
    let paceYearly = 0;
    let paceSource = 'insufficient_history';

    if (monthlyGrowthRate > 0) {
      paceMonthly = monthlyGrowthRate;
      paceYearly = monthlyGrowthRate * 12;
      pace = '+' + monthlyGrowthRate + '/mo';
      paceSource = snapshotCount >= 10 ? 'historical_data' : 'early_estimate';
    } else if (followers > 0) {
      // Fallback: conservative 3% monthly growth estimate for small accounts
      paceMonthly = Math.max(1, Math.round(followers * 0.03));
      paceYearly = paceMonthly * 12;
      pace = '~' + paceMonthly + '/mo';
      paceSource = 'estimated_baseline';
    }

    const sortedByLikes = [...media].sort((a: any, b: any) => (b.like_count ?? 0) - (a.like_count ?? 0));
    const topPost = sortedByLikes[0] ?? null;
    const bottomPost = sortedByLikes.length > 1 ? sortedByLikes[sortedByLikes.length - 1] : null;

    return NextResponse.json({
      profile,
      media,
      metrics: {
        followers,
        following,
        mediaCount,
        handle,
        reach,
        engagementRate,
        contentScore,
        avgLikes,
        avgComments,
        monthlyGrowthRate: paceMonthly,
        yearlyGrowthRate: paceYearly,
        weeklyGrowthRate,
        pace,
        paceSource,
        snapshotCount,
      },
      analytics: {
        avgLikes,
        avgComments,
        totalPosts: media.length,
        topPost,
        bottomPost,
        monthlyGrowthRate: paceMonthly,
        working: topPost
          ? `Best post: ${topPost.like_count} likes. ${topPost.media_type === 'VIDEO' ? 'Video is your strongest format.' : 'Images performing well.'}`
          : 'Post content to see what is working.',
        flopping: media.length > 1 && bottomPost
          ? `Weakest post: ${bottomPost.like_count ?? 0} likes. Identify the pattern and cut it.`
          : 'Post more content to identify patterns.',
      },
      topComments: [],
      savedToSupabase,
      lastUpdated: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('Instagram sync error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
