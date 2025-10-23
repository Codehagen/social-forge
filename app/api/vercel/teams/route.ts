import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Vercel token is available
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      return NextResponse.json({ error: "Vercel integration not configured" }, { status: 503 });
    }

    // Fetch teams from Vercel API
    const response = await fetch("https://api.vercel.com/v2/teams", {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }

    const data = await response.json();
    const teams = data.teams || [];

    return NextResponse.json({
      teams: teams.map((team: any) => ({
        id: team.id,
        slug: team.slug,
        name: team.name,
        avatar: team.avatar,
        created: team.created,
        creatorId: team.creatorId,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch Vercel teams", error);
    return NextResponse.json({ error: "Failed to fetch Vercel teams" }, { status: 500 });
  }
}
