"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/coding-agent/session";
import { getUserConnectors } from "@/lib/coding-agent/connectors";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connectors = await getUserConnectors(session.user.id);
    return NextResponse.json({ connectors });
  } catch (error) {
    console.error("Failed to load connectors", error);
    return NextResponse.json({ error: "Failed to load connectors" }, { status: 500 });
  }
}
