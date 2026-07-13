import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEBUG_SECRET = "283932bf2762c5b21edadf0f7c82416e";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== DEBUG_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.user.count();
  const host = new URL(process.env.DATABASE_URL!).hostname;
  return NextResponse.json({ count, host });
}
