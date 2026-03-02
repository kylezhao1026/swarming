import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
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
    const parsed = createSchema.safeParse(body);

    const space = await prisma.coupleSpace.create({
      data: {
        name: parsed.success ? parsed.data.name || "Our Space 💕" : "Our Space 💕",
        members: { connect: { id: user.id } },
        pet: {
          create: {
            name: "Love Bug",
            species: "🌱",
          },
        },
        streaks: {
          createMany: {
            data: [
              { type: "checkin" },
              { type: "pet_care" },
              { type: "notes" },
            ],
          },
        },
      },
      include: { members: true, pet: true },
    });

    return NextResponse.json({ success: true, data: space }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.coupleSpaceId) {
      return NextResponse.json({ success: true, data: null });
    }

    const space = await prisma.coupleSpace.findUnique({
      where: { id: user.coupleSpaceId },
      include: {
        members: { select: { id: true, name: true, avatarEmoji: true } },
        pet: true,
        streaks: true,
      },
    });

    return NextResponse.json({ success: true, data: space });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
