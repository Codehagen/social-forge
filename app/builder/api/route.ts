import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "AI Website Builder is currently unavailable. This is a mock implementation.",
    status: "disabled",
    version: "1.0.0"
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "AI Website Builder operations are currently disabled. This is a mock implementation.",
    status: "disabled",
    operation: "not_supported"
  });
}
