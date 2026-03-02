import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { generateInviteCode, getInviteExpiry, isInviteExpired } from "@/lib/invite";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.coupleSpaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or no couple space" },
        { status: 401 }
      );
    }

    const space = await prisma.coupleSpace.findUnique({
      where: { id: user.coupleSpaceId },
      include: { members: true },
    });

    if (space && space.members.length >= 2) {
      return NextResponse.json(
        { success: false, error: "Couple space is already full" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.create({
      data: {
        code: generateInviteCode(),
        coupleSpaceId: user.coupleSpaceId,
        senderId: user.id,
        expiresAt: getInviteExpiry(),
      },
    });

    return NextResponse.json(
      { success: true, data: { code: invitation.code, expiresAt: invitation.expiresAt } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

const joinSchema = z.object({ code: z.string().min(1) });

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.coupleSpaceId) {
      return NextResponse.json(
        { success: false, error: "Already in a couple space" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid invite code" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { code: parsed.data.code },
      include: { coupleSpace: { include: { members: true } } },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invite code not found" },
        { status: 404 }
      );
    }

    if (invitation.usedAt || isInviteExpired(invitation.expiresAt)) {
      return NextResponse.json(
        { success: false, error: "Invite code expired or already used" },
        { status: 410 }
      );
    }

    if (invitation.coupleSpace.members.length >= 2) {
      return NextResponse.json(
        { success: false, error: "Couple space is already full" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { coupleSpaceId: invitation.coupleSpaceId },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { coupleSpaceId: invitation.coupleSpaceId },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
