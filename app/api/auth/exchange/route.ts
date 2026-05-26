import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface ExchangeRequest {
  code: string;
  state: string;
}

interface GoogleTokenResponse {
  id_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * POST /api/auth/exchange
 *
 * Server-side handler that:
 *  1. Verifies the CSRF state token stored in the httpOnly cookie.
 *  2. Exchanges the Google authorization code for tokens via Google's token endpoint.
 *  3. Extracts the ID token from Google's response.
 *  4. Forwards the ID token to the FastAPI backend for verification and JWT issuance.
 *  5. Returns the FastAPI response (access_token, refresh_token, user) to the client.
 *
 * No Google credentials are ever exposed to the browser.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse request body
  let body: Partial<ExchangeRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { code, state } = body;

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing required parameters: code and state." },
      { status: 400 }
    );
  }

  // Verify CSRF state against the httpOnly cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;

  // Always delete the state cookie after reading it (one-time use)
  cookieStore.delete("oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.json(
      { error: "Invalid OAuth state. Request may have been tampered with." },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!clientId || !clientSecret || !redirectUri || !apiUrl) {
    return NextResponse.json(
      { error: "Server OAuth configuration is incomplete." },
      { status: 500 }
    );
  }

  // Exchange authorization code with Google
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const googleTokens: GoogleTokenResponse = await tokenRes.json();

  if (!tokenRes.ok || !googleTokens.id_token) {
    console.error("Google token exchange failed:", googleTokens);
    return NextResponse.json(
      { error: googleTokens.error_description ?? "Failed to exchange code with Google." },
      { status: 400 }
    );
  }

  // Forward the ID token to the FastAPI backend for verification and JWT issuance
  const backendRes = await fetch(`${apiUrl}/api/v1/auth/google/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: googleTokens.id_token }),
  });

  const authData = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: authData.detail ?? "Authentication failed." },
      { status: backendRes.status }
    );
  }

  return NextResponse.json(authData);
}
