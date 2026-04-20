app/api/gameflow/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "GameFlow API is working 🚀",
    test: true,
  });
}
