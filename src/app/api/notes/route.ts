import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(500),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      include: { author: { select: { id: true, name: true, avatarEmoji: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notes });
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
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        content: parsed.data.content,
        color: parsed.data.color || "#fff1f2",
        authorId: user.id,
        coupleSpaceId: user.coupleSpaceId,
      },
      include: { author: { select: { id: true, name: true, avatarEmoji: true } } },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("id");
    if (!noteId) {
      return NextResponse.json({ success: false, error: "Note ID required" }, { status: 400 });
    }

    const note = await prisma.note.findFirst({
      where: { id: noteId, authorId: user.id, coupleSpaceId: user.coupleSpaceId },
    });

    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
