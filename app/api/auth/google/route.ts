import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * GET /api/auth/google
 *
 * Constructs the Google OAuth 2.0 authorization URL server-side and redirects
 * the browser to Google's consent screen.
 *
 * GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are never sent to the browser —
 * they live only in server-side environment variables (no NEXT_PUBLIC_ prefix).
 *
 * A random CSRF state token is generated, stored in an httpOnly cookie, and
 * included in the OAuth URL. It will be verified in /api/auth/exchange.
 */
export async function GET(): Promise<NextResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth is not configured on this server." },
      { status: 500 }
    );
  }

  // Generate a random CSRF state token
  const state = crypto.randomBytes(32).toString("hex");

  // Persist state in an httpOnly cookie (10-minute window)
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    state,
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(googleAuthUrl);
}
