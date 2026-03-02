import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { calculateStreak } from "@/lib/streaks";

const checkinSchema = z.object({
  mood: z.enum(["HAPPY", "SAD", "EXCITED", "TIRED", "LOVING", "NEUTRAL"]),
  message: z.string().max(280).optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      include: { author: { select: { id: true, name: true, avatarEmoji: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ success: true, data: checkIns });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.checkIn.findFirst({
      where: { authorId: user.id, date: today },
    });

    if (existing) {
      const updated = await prisma.checkIn.update({
        where: { id: existing.id },
        data: { mood: parsed.data.mood, message: parsed.data.message },
        include: { author: { select: { id: true, name: true, avatarEmoji: true } } },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        mood: parsed.data.mood,
        message: parsed.data.message,
        authorId: user.id,
        coupleSpaceId: user.coupleSpaceId,
        date: today,
      },
      include: { author: { select: { id: true, name: true, avatarEmoji: true } } },
    });

    // Update streak
    const todayStr = today.toISOString().split("T")[0];
    const streak = await prisma.streak.findUnique({
      where: { coupleSpaceId_type: { coupleSpaceId: user.coupleSpaceId, type: "checkin" } },
    });

    if (streak) {
      const newStreak = calculateStreak(
        {
          currentCount: streak.currentCount,
          longestCount: streak.longestCount,
          lastDate: streak.lastDate?.toISOString().split("T")[0] ?? null,
        },
        todayStr
      );

      await prisma.streak.update({
        where: { id: streak.id },
        data: {
          currentCount: newStreak.currentCount,
          longestCount: newStreak.longestCount,
          lastDate: today,
        },
      });
    }

    return NextResponse.json({ success: true, data: checkIn }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
