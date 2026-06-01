import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, image: true, createdAt: true },
    }),
    prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({ user, profile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, age, battingStyle, bowlingStyle, teamName, bio, onboardingDone } = body;

    const [user, profile] = await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: { id: true, email: true, name: true, image: true },
      }),
      prisma.playerProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          age,
          battingStyle,
          bowlingStyle,
          teamName,
          bio,
          onboardingDone: onboardingDone ?? false,
        },
        update: {
          age,
          battingStyle,
          bowlingStyle,
          teamName,
          bio,
          ...(onboardingDone !== undefined && { onboardingDone }),
        },
      }),
    ]);

    return NextResponse.json({ user, profile });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
