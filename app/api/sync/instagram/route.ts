import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json({ 
      error: 'Missing env vars',
      hasAccessToken: !!token,
      hasUserId: !!userId,
    }, { status: 500 });
  }

  try {
    // Real profile data
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count,profile_picture_url,website,biography&access_token=${token}`
    );
    const profile = await profileRes.json();

    // Real media with engagement
    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink,shortcode&limit=20&access_token=${token}`
    );
    const mediaData = await mediaRes.json();
    const media = mediaData.data ?? [];

    // Get comments for top posts
    const mediaWithComments = await Promise.all(
      media.slice(0, 5).map(async (post: any) => {
        try {
          const commentsRes = await fetch(
            `https://graph.instagram.com/${post.id}/comments?fields=id,text,timestamp,like_count,username&limit=10&access_token=${token}`
          );
          const commentsData = await commentsRes.json();
          return { ...post, comments_data: commentsData.data ?? [] };
        } catch {
          return { ...post, comments_data: [] };
        }
      })
    );

    // Calculate what's working and what's flopping
    const sortedByLikes = [...media].sort((a: any, b: any) => (b.like_count ?? 0) - (a.like_count ?? 0));
    const topPost = sortedByLikes[0];
    const bottomPost = sortedByLikes[sortedByLikes.length - 1];

    const avgLikes = media.length > 0 
      ? media.reduce((sum: number, p: any) => sum + (p.like_count ?? 0), 0) / media.length 
      : 0;

    const avgComments = media.length > 0
      ? media.reduce((sum: number, p: any) => sum + (p.comments_count ?? 0), 0) / media.length
      : 0;

    // Top comments across all posts
    const allComments = mediaWithComments
      .flatMap((post: any) => 
        (post.comments_data ?? []).map((c: any) => ({
          ...c,
          post_caption: post.caption?.slice(0, 50) ?? '',
          post_id: post.id,
        }))
      )
      .sort((a: any, b: any) => (b.like_count ?? 0) - (a.like_count ?? 0))
      .slice(0, 5);

    return NextResponse.json({
      profile,
      media: mediaWithComments,
      topComments: allComments,
      analytics: {
        avgLikes: Math.round(avgLikes),
        avgComments: Math.round(avgComments),
        totalPosts: media.length,
        topPost: topPost ?? null,
        bottomPost: bottomPost ?? null,
        working: topPost 
          ? `Your best post got ${topPost.like_count} likes. ${topPost.media_type === 'VIDEO' ? 'Video content is your strongest format.' : 'Image posts are performing well.'}`
          : 'Post some content to see what is working.',
        flopping: bottomPost && bottomPost.id !== topPost?.id
          ? `Your lowest performing post got ${bottomPost.like_count ?? 0} likes. ${bottomPost.media_type === 'IMAGE' ? 'Static images without strong hooks are underperforming.' : 'Some content formats need work.'}`
          : 'Post more content to identify patterns.',
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Instagram sync error:', err);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
