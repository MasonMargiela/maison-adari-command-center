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
    const profileRes = await fetch(
      `https://graph.instagram.com/${userId}?fields=id,username,media_count,account_type&access_token=${token}`
    );
    const profile = await profileRes.json();

    const mediaRes = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink&limit=20&access_token=${token}`
    );
    const media = await mediaRes.json();

    return NextResponse.json({
      profile,
      media: media.data ?? [],
    });
  } catch (err) {
    console.error('Instagram sync error:', err);
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 500 });
  }
}
