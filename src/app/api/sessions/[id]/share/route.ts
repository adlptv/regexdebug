import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if a shareable link already exists
    const existing = await prisma.shareableLink.findFirst({
      where: { sessionId: params.id },
      include: { session: true },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        token: existing.token,
        sessionId: existing.sessionId,
        expiresAt: existing.expiresAt,
        session: existing.session,
      });
    }

    // Create new shareable link
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry

    const link = await prisma.shareableLink.create({
      data: {
        sessionId: params.id,
        token,
        expiresAt,
      },
      include: { session: true },
    });

    return NextResponse.json({
      id: link.id,
      token: link.token,
      sessionId: link.sessionId,
      expiresAt: link.expiresAt,
      session: link.session,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create shareable link", message: (error as Error).message },
      { status: 500 }
    );
  }
}
