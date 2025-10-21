import { NextResponse } from "next/server";
import { getUserGitHubOAuthToken } from "@/lib/github/user-token";

export async function GET() {
  try {
    // Check if user has GitHub token (OAuth only, not env fallbacks)
    const token = await getUserGitHubOAuthToken();

    if (!token) {
      return NextResponse.json({ connected: false });
    }

    // Verify token works by making a simple API call
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        return NextResponse.json({ connected: false });
      }

      const userData = await response.json();

      return NextResponse.json({
        connected: true,
        username: userData.login || null,
        source: "account",
        connectedAt: new Date().toISOString(), // Simplified
      });
    } catch (error) {
      console.error("Failed to validate GitHub token", error);
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error("Failed to resolve GitHub connection status", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
