import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        pattern: true,
        testString: true,
        engine: true,
        redosWarning: true,
        complexity: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sessions", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sessionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: parsed.data,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create session", message: (error as Error).message },
      { status: 500 }
    );
  }
}
