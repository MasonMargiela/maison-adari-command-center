import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

export async function GET() {
  try {
    if (!ACCESS_TOKEN || !ACCOUNT_ID) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing env vars",
          hasAccessToken: !!ACCESS_TOKEN,
          hasAccountId: !!ACCOUNT_ID,
        },
        { status: 500 }
      );
    }

    const profileUrl =
      `https://graph.instagram.com/me` +
      `?fields=user_id,username&access_token=${encodeURIComponent(ACCESS_TOKEN)}`;

    const mediaUrl =
      `https://graph.instagram.com/me/media` +
      `?fields=id,caption,media_type,media_url,timestamp&access_token=${encodeURIComponent(ACCESS_TOKEN)}`;

    const [profileRes, mediaRes] = await Promise.all([
      fetch(profileUrl, { cache: "no-store" }),
      fetch(mediaUrl, { cache: "no-store" }),
    ]);

    const profileText = await profileRes.text();
    const mediaText = await mediaRes.text();

    let profile: unknown = null;
    let media: unknown = null;

    try {
      profile = JSON.parse(profileText);
    } catch {
      profile = { raw: profileText };
    }

    try {
      media = JSON.parse(mediaText);
    } catch {
      media = { raw: mediaText };
    }

    return NextResponse.json({
      ok: true,
      env: {
        hasAccessToken: true,
        hasAccountId: true,
        accountId: ACCOUNT_ID,
      },
      profileStatus: profileRes.status,
      mediaStatus: mediaRes.status,
      profile,
      media,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
