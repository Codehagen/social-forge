import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/coding-agent/session";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        providerId: "github",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect GitHub", error);
    return NextResponse.json({ error: "Failed to disconnect GitHub" }, { status: 500 });
  }
}
