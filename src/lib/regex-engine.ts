import type { DebugStep, MatchResult } from "@/types";

/**
 * Regex Engine with step-by-step tracking.
 * Uses JavaScript's built-in RegExp but simulates step tracking
 * by analyzing the pattern and execution flow.
 */

export interface RegexEngineResult {
  steps: DebugStep[];
  matches: MatchResult[];
  totalSteps: number;
  executionTime: number;
  error?: string;
}

const MAX_STEPS = 10000;
const MAX_EXECUTION_TIME = 5000; // 5 seconds

export function executeRegex(
  pattern: string,
  testString: string,
  flags: string = "g"
): RegexEngineResult {
  const startTime = performance.now();
  const steps: DebugStep[] = [];
  const matches: MatchResult[] = [];

  try {
    if (testString.length > 10000) {
      throw new Error("Input string too long (max 10000 characters)");
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      throw new Error(`Invalid regex: ${(e as Error).message}`);
    }

    steps.push({
      type: "start",
      position: 0,
      regexIndex: 0,
      description: `Starting regex match: /${pattern}/${flags} on input of length ${testString.length}`,
    });

    // Parse the pattern to understand tokens for step tracking
    const tokens = tokenizePattern(pattern);

    if (flags.includes("g") || flags.includes("y")) {
      // Global or sticky — find all matches
      let match: RegExpExecArray | null;
      let lastIndex = 0;
      let matchNumber = 0;

      while ((match = regex.exec(testString)) !== null) {
        matchNumber++;
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        steps.push({
          type: "match",
          position: matchStart,
          regexIndex: 0,
          description: `Match #${matchNumber} found: "${match[0]}" at position ${matchStart}-${matchEnd}`,
          currentMatch: match[0],
        });

        // Track token-by-token within this match
        let pos = matchStart;
        for (let i = 0; i < tokens.length && pos < matchEnd; i++) {
          const token = tokens[i];
          steps.push({
            type: tokenStepType(token),
            position: pos,
            regexIndex: i,
            description: `${token.description} at position ${pos}`,
            currentMatch: testString.slice(
              pos,
              Math.min(pos + token.length, matchEnd)
            ),
          });
          pos += token.length || 1;

          if (steps.length > MAX_STEPS) {
            steps.push({
              type: "fail",
              position: pos,
              regexIndex: i,
              description: "Step limit reached — stopping for safety",
            });
            break;
          }
        }

        // Capture groups
        const groups: MatchResult["groups"] = [];
        for (let g = 1; g < match.length; g++) {
          if (match[g] !== undefined) {
            const groupStart = testString.indexOf(match[g], matchStart);
            groups.push({
              index: g,
              value: match[g],
              start: groupStart,
              end: groupStart + match[g].length,
            });
          }
        }

        // Named groups
        if (match.groups) {
          for (const [name, value] of Object.entries(match.groups)) {
            if (value !== undefined) {
              const groupStart = testString.indexOf(value, matchStart);
              groups.push({
                name,
                index: -1,
                value,
                start: groupStart,
                end: groupStart + value.length,
              });
            }
          }
        }

        matches.push({
          match: match[0],
          index: matchStart,
          groups,
        });

        if (match[0] === "") {
          // Zero-length match — advance manually
          regex.lastIndex++;
        }

        if (regex.lastIndex <= lastIndex) {
          regex.lastIndex = lastIndex + 1;
        }
        lastIndex = regex.lastIndex;

        if (matches.length > 1000) {
          steps.push({
            type: "fail",
            position: lastIndex,
            regexIndex: 0,
            description: "Match limit reached (1000) — stopping for safety",
          });
          break;
        }
      }
    } else {
      // Single match
      const match = regex.exec(testString);
      if (match) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        steps.push({
          type: "match",
          position: matchStart,
          regexIndex: 0,
          description: `Match found: "${match[0]}" at position ${matchStart}-${matchEnd}`,
          currentMatch: match[0],
        });

        // Track tokens
        let pos = matchStart;
        for (let i = 0; i < tokens.length && pos < matchEnd; i++) {
          const token = tokens[i];
          steps.push({
            type: tokenStepType(token),
            position: pos,
            regexIndex: i,
            description: `${token.description} at position ${pos}`,
            currentMatch: testString.slice(
              pos,
              Math.min(pos + token.length, matchEnd)
            ),
          });
          pos += token.length || 1;

          if (steps.length > MAX_STEPS) break;
        }

        const groups: MatchResult["groups"] = [];
        for (let g = 1; g < match.length; g++) {
          if (match[g] !== undefined) {
            const groupStart = testString.indexOf(match[g], matchStart);
            groups.push({
              index: g,
              value: match[g],
              start: groupStart >= 0 ? groupStart : matchStart,
              end: groupStart >= 0 ? groupStart + match[g].length : matchStart,
            });
          }
        }

        if (match.groups) {
          for (const [name, value] of Object.entries(match.groups)) {
            if (value !== undefined) {
              const groupStart = testString.indexOf(value, matchStart);
              groups.push({
                name,
                index: -1,
                value,
                start: groupStart >= 0 ? groupStart : matchStart,
                end: groupStart >= 0 ? groupStart + value.length : matchStart,
              });
            }
          }
        }

        matches.push({
          match: match[0],
          index: matchStart,
          groups,
        });
      } else {
        steps.push({
          type: "fail",
          position: 0,
          regexIndex: 0,
          description: "No match found",
        });
      }
    }

    steps.push({
      type: "complete",
      position: testString.length,
      regexIndex: pattern.length,
      description: `Execution complete. ${matches.length} match(es) found.`,
    });
  } catch (e) {
    const elapsed = performance.now() - startTime;
    if (elapsed > MAX_EXECUTION_TIME) {
      return {
        steps,
        matches,
        totalSteps: steps.length,
        executionTime: elapsed,
        error: "Execution timed out (possible ReDoS)",
      };
    }
    return {
      steps,
      matches,
      totalSteps: steps.length,
      executionTime: elapsed,
      error: (e as Error).message,
    };
  }

  const executionTime = performance.now() - startTime;
  return {
    steps,
    matches,
    totalSteps: steps.length,
    executionTime,
  };
}

interface PatternToken {
  value: string;
  description: string;
  length: number;
  type: string;
}

function tokenizePattern(pattern: string): PatternToken[] {
  const tokens: PatternToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    // Escaped sequences
    if (char === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const meta: Record<string, string> = {
        d: "digit (0-9)",
        D: "non-digit",
        w: "word character (a-z, A-Z, 0-9, _)",
        W: "non-word character",
        s: "whitespace",
        S: "non-whitespace",
        b: "word boundary",
        B: "non-word boundary",
        n: "newline",
        t: "tab",
        r: "carriage return",
        ".": "literal dot",
        "\\": "literal backslash",
      };
      const desc = meta[next] || `escaped character '${next}'`;
      tokens.push({ value: `\\${next}`, description: `\\${next} — ${desc}`, length: 1, type: "escape" });
      i += 2;
      continue;
    }

    // Character class
    if (char === "[") {
      let j = i + 1;
      let negated = false;
      if (pattern[j] === "^") {
        negated = true;
        j++;
      }
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      const classContent = pattern.slice(i, j + 1);
      tokens.push({
        value: classContent,
        description: `${classContent} — character class${negated ? " (negated)" : ""}`,
        length: 1,
        type: "charclass",
      });
      i = j + 1;
      continue;
    }

    // Groups
    if (char === "(") {
      let isNonCapturing = pattern.slice(i, i + 3) === "(?:";
      let isNamed = pattern.slice(i, i + 3) === "(?<";
      let isLookahead = pattern.slice(i, i + 3) === "(?=" || pattern.slice(i, i + 4) === "(?!<";
      let isLookbehind = pattern.slice(i, i + 4) === "(?<=" || pattern.slice(i, i + 5) === "(?<!>";

      let j = i + 1;
      let depth = 1;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === "(") depth++;
        if (pattern[j] === ")") depth--;
        if (pattern[j] === "\\") j++;
        j++;
      }

      const groupContent = pattern.slice(i, j);
      let desc = "capturing group";
      if (isNonCapturing) desc = "non-capturing group";
      else if (isNamed) desc = "named capturing group";
      else if (isLookahead) desc = "lookahead assertion";
      else if (isLookbehind) desc = "lookbehind assertion";

      tokens.push({
        value: groupContent,
        description: `${groupContent} — ${desc}`,
        length: 1,
        type: "group",
      });
      i = j;
      continue;
    }

    // Quantifiers
    if (char === "*" || char === "+" || char === "?") {
      const greedy = pattern[i + 1] !== "?";
      const quantDesc: Record<string, string> = {
        "*": greedy ? "0 or more (greedy)" : "0 or more (lazy)",
        "+": greedy ? "1 or more (greedy)" : "1 or more (lazy)",
        "?": greedy ? "0 or 1 (greedy)" : "0 or 1 (lazy)",
      };
      tokens.push({
        value: greedy ? char : `${char}?`,
        description: `${char}${greedy ? "" : "?"} — ${quantDesc[char]}`,
        length: 0,
        type: "quantifier",
      });
      i += greedy ? 1 : 2;
      continue;
    }

    if (char === "{") {
      let j = i;
      while (j < pattern.length && pattern[j] !== "}") j++;
      const quantifier = pattern.slice(i, j + 1);
      tokens.push({
        value: quantifier,
        description: `${quantifier} — quantifier`,
        length: 0,
        type: "quantifier",
      });
      i = j + 1;
      continue;
    }

    // Anchors
    if (char === "^") {
      tokens.push({ value: "^", description: "^ — start of string", length: 0, type: "anchor" });
      i++;
      continue;
    }
    if (char === "$") {
      tokens.push({ value: "$", description: "$ — end of string", length: 0, type: "anchor" });
      i++;
      continue;
    }

    // Alternation
    if (char === "|") {
      tokens.push({ value: "|", description: "| — alternation (OR)", length: 0, type: "alternation" });
      i++;
      continue;
    }

    // Wildcard
    if (char === ".") {
      tokens.push({ value: ".", description: ". — any character", length: 1, type: "wildcard" });
      i++;
      continue;
    }

    // Literal
    tokens.push({
      value: char,
      description: `'${char}' — literal character`,
      length: 1,
      type: "literal",
    });
    i++;
  }

  return tokens;
}

function tokenStepType(token: PatternToken): DebugStep["type"] {
  switch (token.type) {
    case "anchor":
      return "anchor";
    case "wildcard":
      return "wildcard";
    case "charclass":
      return "charclass";
    case "group":
      return "group-start";
    case "quantifier":
      return "quantifier";
    case "escape":
      return "char";
    case "alternation":
      return "char";
    default:
      return "char";
  }
}

/**
 * Measure regex execution time across different input sizes
 */
export function benchmarkRegex(
  pattern: string,
  baseInput: string,
  flags: string = "g"
): { size: number; time: number }[] {
  const results: { size: number; time: number }[] = [];
  const sizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

  for (const mult of sizes) {
    const input = baseInput.repeat(Math.min(mult, Math.ceil(10000 / (baseInput.length || 1))));
    if (input.length > 10000) continue;

    const start = performance.now();
    try {
      const regex = new RegExp(pattern, flags);
      regex.exec(input);
    } catch {
      // ignore
    }
    const time = performance.now() - start;
    results.push({ size: input.length, time });
  }

  return results;
}
