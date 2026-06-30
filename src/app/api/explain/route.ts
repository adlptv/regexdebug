import { NextRequest, NextResponse } from "next/server";
import { explainSchema } from "@/lib/validators";
import { explainPattern } from "@/lib/explainer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = explainSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const tokens = explainPattern(parsed.data.pattern);
    return NextResponse.json({ tokens });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
