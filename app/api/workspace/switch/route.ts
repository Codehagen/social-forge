import { NextRequest, NextResponse } from "next/server";
import { switchWorkspace } from "@/app/actions/workspace";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    await switchWorkspace(workspaceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error switching workspace:", error);
    return NextResponse.json(
      { error: "Failed to switch workspace" },
      { status: 500 }
    );
  }
}
