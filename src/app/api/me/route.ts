import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_ID = process.env.PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;

function getClient(): PrivyClient | null {
  if (!APP_ID || !APP_SECRET) return null;
  return new PrivyClient(APP_ID, APP_SECRET);
}

export async function GET(request: Request) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { authenticated: false, error: "Server auth is not configured." },
      { status: 500 },
    );
  }

  // Accept the Privy access token via Authorization header or the privy-token cookie.
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const cookieToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("privy-token="))
    ?.split("=")[1];

  const token = bearer || cookieToken;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const claims = await client.verifyAuthToken(token);
    return NextResponse.json({
      authenticated: true,
      userId: claims.userId,
      appId: claims.appId,
      issuedAt: claims.issuedAt,
      expiration: claims.expiration,
      sessionId: claims.sessionId,
    });
  } catch {
    return NextResponse.json({ authenticated: false, error: "Invalid or expired token." }, { status: 401 });
  }
}
