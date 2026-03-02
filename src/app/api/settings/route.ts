import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { CUTE_AVATARS } from "@/lib/avatars";

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatarEmoji: z.enum(CUTE_AVATARS).optional(),
  spaceName: z.string().min(1).max(50).optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, avatarEmoji: true, coupleSpaceId: true },
    });

    let space = null;
    if (fullUser?.coupleSpaceId) {
      space = await prisma.coupleSpace.findUnique({
        where: { id: fullUser.coupleSpaceId },
        include: {
          members: { select: { id: true, name: true, email: true, avatarEmoji: true } },
        },
      });
    }

    return NextResponse.json({ success: true, data: { user: fullUser, space } });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, avatarEmoji, spaceName } = parsed.data;

    if (name || avatarEmoji) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(avatarEmoji && { avatarEmoji }),
        },
      });
    }

    if (spaceName && user.coupleSpaceId) {
      await prisma.coupleSpace.update({
        where: { id: user.coupleSpaceId },
        data: { name: spaceName },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Not in a couple space" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { coupleSpaceId: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
