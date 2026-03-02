import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function createEmptyCanvas(w: number, h: number): string[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => ""));
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let canvas = await prisma.pixelCanvas.findUnique({
      where: { coupleSpaceId: user.coupleSpaceId },
    });

    if (!canvas) {
      canvas = await prisma.pixelCanvas.create({
        data: {
          coupleSpaceId: user.coupleSpaceId,
          pixels: createEmptyCanvas(32, 32),
          width: 32,
          height: 32,
        },
      });
    }

    return NextResponse.json({ success: true, data: canvas });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.pixels || !Array.isArray(body.pixels)) {
      return NextResponse.json({ success: false, error: "Invalid pixels data" }, { status: 400 });
    }

    const canvas = await prisma.pixelCanvas.upsert({
      where: { coupleSpaceId: user.coupleSpaceId },
      update: { pixels: body.pixels },
      create: {
        coupleSpaceId: user.coupleSpaceId,
        pixels: body.pixels,
        width: 32,
        height: 32,
      },
    });

    return NextResponse.json({ success: true, data: canvas });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user?.coupleSpaceId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await prisma.pixelCanvas.update({
      where: { coupleSpaceId: user.coupleSpaceId },
      data: { pixels: createEmptyCanvas(32, 32) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
