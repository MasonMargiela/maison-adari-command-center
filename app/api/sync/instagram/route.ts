import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'No Instagram token configured' }, { status: 500 });
  }

  try {
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,profile_picture_url&access_token=${token}`
    );
    const profile = await profileRes.json();

    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count,media_url,thumbnail_url,permalink&limit=20&access_token=${token}`
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
