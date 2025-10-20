import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "AI Website Builder is currently unavailable. This is a mock implementation.",
    status: "disabled",
    version: "1.0.0"
  });
}

export async function POST() {
  return NextResponse.json({
    message: "AI Website Builder operations are currently disabled. This is a mock implementation.",
    status: "disabled",
    operation: "not_supported"
  });
}
