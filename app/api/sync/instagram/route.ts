import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Fetch profile
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count,profile_picture_url,biography,website&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return NextResponse.json({ error: profile.error.message }, { status: 200 });
    }

    // Fetch media
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink&limit=20&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    const media = mediaData.data ?? [];

    const followers = profile.followers_count ?? 0;
    const following = profile.follows_count ?? 0;
    const mediaCount = profile.media_count ?? 0;
    const handle = "@" + profile.username;

    // Real engagement calculation
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

    // Real reach estimate
    const reachEstimate = media.length > 0
      ? Math.round((followers * 0.15) + (avgLikes * 2.5))
      : Math.round(followers * 0.15);
    const reach = reachEstimate >= 1000 ? (reachEstimate / 1000).toFixed(1) + "K" : String(reachEstimate);

    // Save to Supabase
    let accountId: string | null = null;
    try {
      const { data: accountData } = await supabase
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
      accountId = accountData?.id ?? null;

      if (accountId) {
        await supabase.from('metric_snapshots').insert([
          { connected_account_id: accountId, platform: 'instagram', metric_type: 'followers_count', metric_value: followers },
          { connected_account_id: accountId, platform: 'instagram', metric_type: 'follows_count', metric_value: following },
          { connected_account_id: accountId, platform: 'instagram', metric_type: 'media_count', metric_value: mediaCount },
          { connected_account_id: accountId, platform: 'instagram', metric_type: 'engagement_rate', metric_value: engagementRate },
        ]);
      }
    } catch (dbErr) {
      console.error('Supabase error:', dbErr);
    }

    // Calculate real monthly growth from Supabase history
    let monthlyGrowthRate = 0;
    let pace = "Estimating...";
    let paceNote = "Need more history";
    if (accountId) {
      try {
        const { data: snapshots } = await supabase
          .from('metric_snapshots')
          .select('metric_value, recorded_at')
          .eq('connected_account_id', accountId)
          .eq('metric_type', 'followers_count')
          .order('recorded_at', { ascending: false })
          .limit(60);

        if (snapshots && snapshots.length >= 2) {
          const newest = Number(snapshots[0].metric_value);
          const oldest = Number(snapshots[snapshots.length - 1].metric_value);
          const daysDiff = (new Date(snapshots[0].recorded_at).getTime() - new Date(snapshots[snapshots.length - 1].recorded_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 0) {
            monthlyGrowthRate = Math.round(((newest - oldest) / daysDiff) * 30);
            pace = "+" + monthlyGrowthRate + "/mo";
            paceNote = "based on " + Math.round(daysDiff) + " days of data";
          }
        }
      } catch (e) {
        console.error('Growth calc error:', e);
      }
    }

    // Content score (0-100)
    const engScore = Math.min(40, (engagementRate / 10) * 40);
    const postScore = Math.min(30, (Math.min(mediaCount, 10) / 10) * 30);
    const growthScore = Math.min(30, (Math.min(monthlyGrowthRate, 100) / 100) * 30);
    const contentScore = Math.round(engScore + postScore + growthScore);

    // Top performing posts
    const sortedByLikes = [...media].sort((a: any, b: any) => (b.like_count ?? 0) - (a.like_count ?? 0));
    const topPost = sortedByLikes[0] ?? null;
    const bottomPost = sortedByLikes.length > 1 ? sortedByLikes[sortedByLikes.length - 1] : null;

    return NextResponse.json({
      // Raw profile
      profile,
      media,
      // Pre-calculated metrics (use these directly in UI)
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
        monthlyGrowthRate,
        pace,
        paceNote,
      },
      // Analytics
      analytics: {
        avgLikes,
        avgComments,
        totalPosts: media.length,
        topPost,
        bottomPost,
        monthlyGrowthRate,
        working: topPost
          ? `Your best post got ${topPost.like_count} likes. ${topPost.media_type === 'VIDEO' ? 'Video content is your strongest format.' : 'Image posts are performing well.'}`
          : 'Post some content to see what is working.',
        flopping: bottomPost && bottomPost.id !== topPost?.id
          ? `Your lowest post got ${bottomPost.like_count ?? 0} likes.`
          : 'Post more content to identify patterns.',
      },
      topComments: [],
      savedToSupabase: !!accountId,
      lastUpdated: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Instagram sync error:', err);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
