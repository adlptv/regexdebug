import { NextRequest, NextResponse } from "next/server";
import { generateTestsSchema } from "@/lib/validators";
import { generateTests } from "@/lib/test-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = generateTestsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { pattern, count } = parsed.data;
    const tests = generateTests(pattern, count);

    return NextResponse.json({ tests });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
