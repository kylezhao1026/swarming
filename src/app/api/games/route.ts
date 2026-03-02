import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const sessionSchema = z.object({
  gameType: z.enum(["MEMORY_MATCH", "LOVE_TRIVIA"]),
  score: z.number().min(0),
  moves: z.number().min(0),
  completed: z.boolean(),
  metadata: z.any().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.gameSession.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      include: { player: { select: { id: true, name: true, avatarEmoji: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: sessions });
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
    const parsed = sessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const session = await prisma.gameSession.create({
      data: {
        gameType: parsed.data.gameType,
        score: parsed.data.score,
        moves: parsed.data.moves,
        completed: parsed.data.completed,
        metadata: parsed.data.metadata,
        playerId: user.id,
        coupleSpaceId: user.coupleSpaceId,
      },
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
