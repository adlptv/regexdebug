import { z } from "zod";

export const debugSchema = z.object({
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .max(500, "Pattern too long"),
  testString: z
    .string()
    .max(10000, "Test string too long"),
  flags: z
    .string()
    .max(10, "Flags too long")
    .regex(/^[gimsuy]*$/, "Invalid flags")
    .default("g"),
  engine: z
    .enum(["javascript"])
    .default("javascript"),
});

export const redosCheckSchema = z.object({
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .max(500, "Pattern too long"),
});

export const generateTestsSchema = z.object({
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .max(500, "Pattern too long"),
  count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5),
});

export const explainSchema = z.object({
  pattern: z
    .string()
    .min(1, "Pattern is required")
    .max(500, "Pattern too long"),
});

export const sessionCreateSchema = z.object({
  name: z.string().max(100).optional().default("Untitled Session"),
  pattern: z.string().min(1).max(500),
  testString: z.string().max(10000).default(""),
  engine: z.enum(["javascript"]).default("javascript"),
  steps: z.string().default("[]"),
  captures: z.string().default("[]"),
  redosWarning: z.boolean().default(false),
  complexity: z.string().max(20).default("O(n)"),
});

export const sessionDeleteSchema = z.object({
  id: z.string().cuid(),
});
