import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json({ error: 'Missing env vars', hasAccessToken: !!token, hasUserId: !!userId }, { status: 500 });
  }

  // Use service role for server-side writes
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count,profile_picture_url,biography,website&access_token=${token}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return NextResponse.json({ error: profile.error.message, profile: null, media: [] }, { status: 200 });
    }

    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink&limit=20&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    const media = mediaData.data ?? [];

    // Upsert connected account
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

    const accountId = accountData?.id;

    if (accountId) {
      // Save metric snapshot
      await supabase.from('metric_snapshots').insert([
        { connected_account_id: accountId, platform: 'instagram', metric_type: 'followers_count', metric_value: profile.followers_count ?? 0 },
        { connected_account_id: accountId, platform: 'instagram', metric_type: 'follows_count', metric_value: profile.follows_count ?? 0 },
        { connected_account_id: accountId, platform: 'instagram', metric_type: 'media_count', metric_value: profile.media_count ?? 0 },
      ]);

      // Save posts
      for (const post of media) {
        const { data: newPost } = await supabase
          .from('content_items')
          .upsert({
            connected_account_id: accountId,
            platform: 'instagram',
            platform_content_id: post.id,
            caption: post.caption ?? '',
            media_url: post.media_url ?? post.thumbnail_url ?? '',
            permalink: post.permalink ?? '',
            published_at: post.timestamp,
          }, { onConflict: 'platform_content_id' })
          .select('id')
          .single();

        if (newPost?.id) {
          await supabase.from('content_metric_snapshots').insert([
            { content_item_id: newPost.id, metric_type: 'like_count', metric_value: post.like_count ?? 0 },
            { content_item_id: newPost.id, metric_type: 'comments_count', metric_value: post.comments_count ?? 0 },
          ]);
        }
      }

      // Calculate follower growth rate from historical data
      const { data: recentSnapshots } = await supabase
        .from('metric_snapshots')
        .select('metric_value, recorded_at')
        .eq('connected_account_id', accountId)
        .eq('metric_type', 'followers_count')
        .order('recorded_at', { ascending: false })
        .limit(30);

      let monthlyGrowthRate = 0;
      if (recentSnapshots && recentSnapshots.length >= 2) {
        const newest = recentSnapshots[0].metric_value;
        const oldest = recentSnapshots[recentSnapshots.length - 1].metric_value;
        const daysDiff = (new Date(recentSnapshots[0].recorded_at).getTime() - new Date(recentSnapshots[recentSnapshots.length - 1].recorded_at).getTime()) / (1000 * 60 * 60 * 24);
        monthlyGrowthRate = daysDiff > 0 ? Math.round(((newest - oldest) / daysDiff) * 30) : 0;
      }

      const sortedByLikes = [...media].sort((a: any, b: any) => (b.like_count ?? 0) - (a.like_count ?? 0));
      const topPost = sortedByLikes[0];
      const bottomPost = sortedByLikes[sortedByLikes.length - 1];

      return NextResponse.json({
        profile,
        media,
        topComments: [],
        analytics: {
          avgLikes: media.length > 0 ? Math.round(media.reduce((s: number, p: any) => s + (p.like_count ?? 0), 0) / media.length) : 0,
          avgComments: 0,
          totalPosts: media.length,
          topPost: topPost ?? null,
          bottomPost: bottomPost ?? null,
          monthlyGrowthRate,
          working: topPost ? `Your best post got ${topPost.like_count} likes.` : 'Post some content to see what is working.',
          flopping: 'Post more content to identify patterns.',
        },
        savedToSupabase: true,
        accountId,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({ profile, media, savedToSupabase: false, lastUpdated: new Date().toISOString() });

  } catch (err) {
    console.error('Instagram sync error:', err);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
