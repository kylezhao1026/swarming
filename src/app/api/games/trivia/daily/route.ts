import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { DEFAULT_TRIVIA_QUESTIONS } from "@/lib/games";

const submitSchema = z.object({
  answer: z.string().trim().min(1).max(300),
});

function dayKeyFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickDailyQuestion(coupleSpaceId: string, date: Date, custom: any[]) {
  const all = [
    ...DEFAULT_TRIVIA_QUESTIONS.map((q, idx) => ({
      id: `default-${idx}`,
      question: q.question,
      isDefault: true,
    })),
    ...custom.map((q) => ({
      id: q.id,
      question: q.question,
      isDefault: false,
    })),
  ];

  const key = dayKeyFromDate(date);
  if (all.length === 0) return { key, question: null };

  const idx = hashString(`${coupleSpaceId}:${key}`) % all.length;
  return { key, question: all[idx] };
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const { key, question } = pickDailyQuestion(
      user.coupleSpaceId,
      now,
      await prisma.triviaQuestion.findMany({
        where: { coupleSpaceId: user.coupleSpaceId },
        select: { id: true, question: true },
      })
    );

    if (!question) {
      return NextResponse.json({ success: false, error: "No trivia questions available" }, { status: 404 });
    }

    const { start, end } = getDayRange(now);
    const sessions = await prisma.gameSession.findMany({
      where: {
        coupleSpaceId: user.coupleSpaceId,
        gameType: "LOVE_TRIVIA",
        createdAt: { gte: start, lt: end },
      },
      include: {
        player: { select: { id: true, name: true, avatarEmoji: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const answers = sessions
      .map((session) => {
        const metadata = session.metadata as any;
        if (
          metadata?.kind !== "daily-trivia" ||
          metadata?.questionId !== question.id ||
          metadata?.dayKey !== key
        ) {
          return null;
        }

        return {
          id: session.id,
          answer: metadata.answer as string,
          createdAt: session.createdAt,
          player: session.player,
          isMine: session.playerId === user.id,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        dayKey: key,
        question,
        answers,
        hasAnswered: answers.some((a: any) => a.isMine),
      },
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
    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const now = new Date();
    const custom = await prisma.triviaQuestion.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      select: { id: true, question: true },
    });

    const { key, question } = pickDailyQuestion(user.coupleSpaceId, now, custom);
    if (!question) {
      return NextResponse.json({ success: false, error: "No trivia questions available" }, { status: 404 });
    }

    const { start, end } = getDayRange(now);
    const existingToday = await prisma.gameSession.findFirst({
      where: {
        coupleSpaceId: user.coupleSpaceId,
        playerId: user.id,
        gameType: "LOVE_TRIVIA",
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: "desc" },
    });

    const metadata = {
      kind: "daily-trivia",
      dayKey: key,
      questionId: question.id,
      question: question.question,
      answer: parsed.data.answer,
    };

    let saved;
    if (existingToday && (existingToday.metadata as any)?.kind === "daily-trivia") {
      saved = await prisma.gameSession.update({
        where: { id: existingToday.id },
        data: { metadata },
      });
    } else {
      saved = await prisma.gameSession.create({
        data: {
          gameType: "LOVE_TRIVIA",
          score: 0,
          moves: 1,
          completed: true,
          playerId: user.id,
          coupleSpaceId: user.coupleSpaceId,
          metadata,
        },
      });
    }

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
