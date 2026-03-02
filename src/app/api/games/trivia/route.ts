import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { DEFAULT_TRIVIA_QUESTIONS } from "@/lib/games";

const triviaSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(200),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const custom = await prisma.triviaQuestion.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      orderBy: { createdAt: "desc" },
    });

    const defaults = DEFAULT_TRIVIA_QUESTIONS.map((q, i) => ({
      id: `default-${i}`,
      question: q.question,
      answer: "",
      authorId: "system",
      isDefault: true,
    }));

    return NextResponse.json({
      success: true,
      data: { custom, defaults },
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
    const parsed = triviaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const question = await prisma.triviaQuestion.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        authorId: user.id,
        coupleSpaceId: user.coupleSpaceId,
      },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
