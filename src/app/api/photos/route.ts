import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const photoSchema = z.object({
  imageData: z
    .string()
    .min(1)
    .refine((s) => s.startsWith("data:image/"), "Must be a data URI"),
  caption: z.string().max(200).optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const photos = await prisma.photo.findMany({
      where: { coupleSpaceId: user.coupleSpaceId },
      orderBy: { createdAt: "desc" },
      take: 120,
    });

    return NextResponse.json({ success: true, data: photos });
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
    const parsed = photoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // ~10MB binary image can become ~13.5MB as base64 data URI
    if (parsed.data.imageData.length > 13_500_000) {
      return NextResponse.json(
        { success: false, error: "Image too large (max ~10MB)" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        imageData: parsed.data.imageData,
        caption: parsed.data.caption,
        authorId: user.id,
        coupleSpaceId: user.coupleSpaceId,
      },
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
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
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id, authorId: user.id, coupleSpaceId: user.coupleSpaceId },
    });
    if (!photo) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    await prisma.photo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
