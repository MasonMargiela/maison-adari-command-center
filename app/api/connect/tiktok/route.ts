import { NextResponse } from "next/server";

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  const url = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientKey}&redirect_uri=${redirectUri}&response_type=code&scope=user.info.basic`;

  return NextResponse.redirect(url);
}