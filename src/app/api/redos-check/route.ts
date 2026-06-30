import { NextRequest, NextResponse } from "next/server";
import { redosCheckSchema } from "@/lib/validators";
import { detectRedos } from "@/lib/redos-detector";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = redosCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = detectRedos(parsed.data.pattern);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
