import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { applyAction, calculateDecay } from "@/lib/pet";
import { calculateStreak } from "@/lib/streaks";

const actionSchema = z.object({
  action: z.enum(["feed", "play", "water"]),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const pet = await prisma.pet.findUnique({
      where: { coupleSpaceId: user.coupleSpaceId },
    });

    if (!pet) {
      return NextResponse.json({ success: false, error: "No pet found" }, { status: 404 });
    }

    // Apply time-based decay
    const decayed = calculateDecay(
      {
        hunger: pet.hunger,
        happiness: pet.happiness,
        health: pet.health,
        experience: pet.experience,
        growthStage: pet.growthStage,
        lastFed: pet.lastFed,
        lastPlayed: pet.lastPlayed,
      },
      new Date()
    );

    return NextResponse.json({
      success: true,
      data: { ...pet, ...decayed },
    });
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
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findUnique({
      where: { coupleSpaceId: user.coupleSpaceId },
    });

    if (!pet) {
      return NextResponse.json({ success: false, error: "No pet found" }, { status: 404 });
    }

    const now = new Date();
    const decayed = calculateDecay(
      {
        hunger: pet.hunger,
        happiness: pet.happiness,
        health: pet.health,
        experience: pet.experience,
        growthStage: pet.growthStage,
        lastFed: pet.lastFed,
        lastPlayed: pet.lastPlayed,
      },
      now
    );

    const updated = applyAction(decayed, parsed.data.action, now);

    const savedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: {
        hunger: updated.hunger,
        happiness: updated.happiness,
        health: updated.health,
        experience: updated.experience,
        growthStage: updated.growthStage,
        lastFed: updated.lastFed,
        lastPlayed: updated.lastPlayed,
      },
    });

    // Update pet care streak
    const todayStr = now.toISOString().split("T")[0];
    const streak = await prisma.streak.findUnique({
      where: {
        coupleSpaceId_type: { coupleSpaceId: user.coupleSpaceId, type: "pet_care" },
      },
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
          lastDate: new Date(todayStr),
        },
      });
    }

    return NextResponse.json({ success: true, data: savedPet });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
