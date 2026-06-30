import { NextRequest, NextResponse } from "next/server";
import { debugSchema } from "@/lib/validators";
import { executeRegex } from "@/lib/regex-engine";
import { detectRedos } from "@/lib/redos-detector";

const MAX_REQUESTS = 100;
const WINDOW_MS = 60_000;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = requestCounts.get(ip);
  if (!existing || now > existing.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS) return false;
  existing.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = debugSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { pattern, testString, flags, engine } = parsed.data;

    // ReDoS check
    const redosResult = detectRedos(pattern);

    // Execute with time limit
    const result = executeRegex(pattern, testString, flags);

    return NextResponse.json({
      ...result,
      redosWarning: redosResult.isVulnerable,
      complexity: redosResult.complexity,
      redosDetails: redosResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
