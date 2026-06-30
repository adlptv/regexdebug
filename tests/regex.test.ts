import { describe, it, expect } from "vitest";
import { executeRegex } from "@/lib/regex-engine";
import { detectRedos } from "@/lib/redos-detector";
import { generateTests } from "@/lib/test-generator";
import { explainPattern } from "@/lib/explainer";

describe("Regex Engine", () => {
  it("should execute a simple match", () => {
    const result = executeRegex("hello", "hello world", "g");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].match).toBe("hello");
    expect(result.matches[0].index).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it("should find multiple matches with global flag", () => {
    const result = executeRegex("a", "banana", "g");
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].index).toBe(1);
    expect(result.matches[1].index).toBe(3);
    expect(result.matches[2].index).toBe(5);
  });

  it("should capture groups correctly", () => {
    const result = executeRegex("(\\d+)-(\\d+)", "12-34", "");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].match).toBe("12-34");
    expect(result.matches[0].groups).toHaveLength(2);
    expect(result.matches[0].groups[0].value).toBe("12");
    expect(result.matches[0].groups[1].value).toBe("34");
  });

  it("should handle named groups", () => {
    const result = executeRegex("(?<year>\\d{4})-(?<month>\\d{2})", "2024-03", "");
    expect(result.matches).toHaveLength(1);
    const namedGroups = result.matches[0].groups.filter((g) => g.name);
    expect(namedGroups).toHaveLength(2);
    expect(namedGroups.find((g) => g.name === "year")?.value).toBe("2024");
    expect(namedGroups.find((g) => g.name === "month")?.value).toBe("03");
  });

  it("should return steps for debugging", () => {
    const result = executeRegex("abc", "abc", "g");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].type).toBe("start");
    expect(result.steps[result.steps.length - 1].type).toBe("complete");
  });

  it("should handle no match", () => {
    const result = executeRegex("xyz", "abc", "g");
    expect(result.matches).toHaveLength(0);
  });

  it("should handle invalid regex gracefully", () => {
    const result = executeRegex("[", "abc", "g");
    expect(result.error).toBeDefined();
  });

  it("should reject oversized input", () => {
    const longString = "a".repeat(20000);
    const result = executeRegex("a", longString, "g");
    expect(result.error).toBeDefined();
  });

  it("should track execution time", () => {
    const result = executeRegex("test", "this is a test string", "g");
    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });
});

describe("ReDoS Detector", () => {
  it("should detect nested quantifiers", () => {
    const result = detectRedos("(a+)+");
    expect(result.isVulnerable).toBe(true);
    expect(result.complexity).toBe("O(2ⁿ)");
    expect(result.patterns.length).toBeGreaterThan(0);
  });

  it("should detect overlapping alternatives", () => {
    const result = detectRedos("(a|a)*");
    expect(result.isVulnerable).toBe(true);
    expect(result.patterns.length).toBeGreaterThan(0);
  });

  it("should flag safe patterns as not vulnerable", () => {
    const result = detectRedos("\\d{4}-\\d{2}-\\d{2}");
    expect(result.isVulnerable).toBe(false);
    expect(result.complexity).toBe("O(n)");
  });

  it("should detect greedy wildcard issues", () => {
    const result = detectRedos(".*.*");
    expect(result.isVulnerable).toBe(true);
  });

  it("should provide suggestions for vulnerable patterns", () => {
    const result = detectRedos("(a+)+");
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("should provide explanation text", () => {
    const result = detectRedos("abc");
    expect(result.explanation).toBeDefined();
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});

describe("Test Generator", () => {
  it("should generate test cases for digit pattern", () => {
    const tests = generateTests("\\d+", 5);
    expect(tests.length).toBeGreaterThan(0);
    expect(tests.some((t) => t.shouldMatch)).toBe(true);
    expect(tests.some((t) => !t.shouldMatch)).toBe(true);
  });

  it("should generate correct count of tests", () => {
    const tests = generateTests("[a-z]+", 3);
    expect(tests.length).toBeGreaterThanOrEqual(3);
  });

  it("should verify match results", () => {
    const tests = generateTests("\\d{3}", 5);
    for (const test of tests) {
      expect(typeof test.actualMatch).toBe("boolean");
    }
  });

  it("should handle complex patterns", () => {
    const tests = generateTests("[a-zA-Z0-9]+@[a-z]+\\.[a-z]+", 3);
    expect(tests.length).toBeGreaterThan(0);
  });
});

describe("Explainer", () => {
  it("should explain literal characters", () => {
    const tokens = explainPattern("abc");
    expect(tokens).toHaveLength(3);
    expect(tokens[0].type).toBe("literal");
    expect(tokens[0].description).toContain("literal");
  });

  it("should explain escaped sequences", () => {
    const tokens = explainPattern("\\d+");
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    const digitToken = tokens.find((t) => t.token === "\\d");
    expect(digitToken).toBeDefined();
    expect(digitToken?.description).toContain("digit");
  });

  it("should explain quantifiers", () => {
    const tokens = explainPattern("a*");
    const quantToken = tokens.find((t) => t.type === "quantifier");
    expect(quantToken).toBeDefined();
    expect(quantToken?.description).toContain("0 or more");
  });

  it("should explain character classes", () => {
    const tokens = explainPattern("[a-z]");
    const classToken = tokens.find((t) => t.type === "charclass");
    expect(classToken).toBeDefined();
    expect(classToken?.description).toContain("lowercase");
  });

  it("should explain anchors", () => {
    const tokens = explainPattern("^abc$");
    const anchorTokens = tokens.filter((t) => t.type === "anchor");
    expect(anchorTokens).toHaveLength(2);
  });

  it("should explain groups", () => {
    const tokens = explainPattern("(abc)");
    const groupToken = tokens.find((t) => t.type === "group");
    expect(groupToken).toBeDefined();
    expect(groupToken?.description).toContain("capturing");
  });

  it("should explain alternation", () => {
    const tokens = explainPattern("a|b");
    const altToken = tokens.find((t) => t.type === "alternation");
    expect(altToken).toBeDefined();
    expect(altToken?.description).toContain("OR");
  });

  it("should explain named groups", () => {
    const tokens = explainPattern("(?<name>\\w+)");
    const groupToken = tokens.find((t) => t.type === "group");
    expect(groupToken).toBeDefined();
    expect(groupToken?.description).toContain("named");
    expect(groupToken?.description).toContain("name");
  });

  it("should explain lookaheads", () => {
    const tokens = explainPattern("a(?=b)");
    const lookahead = tokens.find((t) => t.description.includes("lookahead"));
    expect(lookahead).toBeDefined();
  });

  it("should explain {n,m} quantifiers", () => {
    const tokens = explainPattern("a{2,4}");
    const quant = tokens.find((t) => t.type === "quantifier");
    expect(quant).toBeDefined();
    expect(quant?.description).toContain("between 2 and 4");
  });
});
