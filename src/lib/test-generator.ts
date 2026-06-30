import type { GeneratedTest } from "@/types";

/**
 * Generate valid and invalid test cases from a regex pattern.
 * Uses pattern analysis to construct inputs that should match
 * and inputs that should not match.
 */

export function generateTests(pattern: string, count: number = 5): GeneratedTest[] {
  const tests: GeneratedTest[] = [];
  const validInputs = generateValidInputs(pattern, count);
  const invalidInputs = generateInvalidInputs(pattern, count);

  // Test valid inputs
  for (const input of validInputs) {
    let actualMatch = false;
    let matchValue: string | undefined;
    try {
      const regex = new RegExp(pattern);
      const match = regex.exec(input);
      if (match) {
        actualMatch = true;
        matchValue = match[0];
      }
    } catch {
      // invalid regex
    }
    tests.push({ input, shouldMatch: true, actualMatch, matchValue });
  }

  // Test invalid inputs
  for (const input of invalidInputs) {
    let actualMatch = false;
    let matchValue: string | undefined;
    try {
      const regex = new RegExp(pattern);
      const match = regex.exec(input);
      if (match) {
        actualMatch = true;
        matchValue = match[0];
      }
    } catch {
      // invalid regex
    }
    tests.push({ input, shouldMatch: false, actualMatch, matchValue });
  }

  return tests;
}

function generateValidInputs(pattern: string, count: number): string[] {
  const inputs: string[] = [];
  const generated = expandPattern(pattern);

  // Use generated strings
  for (let i = 0; i < Math.min(count, generated.length); i++) {
    inputs.push(generated[i]);
  }

  // Pad with variations
  while (inputs.length < count) {
    const base = generated[0] || "test";
    const variation = base + Math.random().toString(36).substring(2, 6);
    inputs.push(variation);
  }

  return inputs.slice(0, count);
}

function generateInvalidInputs(pattern: string, count: number): string[] {
  const inputs: string[] = [];
  const generated = expandPattern(pattern);

  // Create variations that likely won't match
  const negations: Record<string, string> = {
    "\\d": "abcXYZ",
    "\\w": "!@#$%",
    "\\s": "ABC123",
    "[a-z]": "789",
    "[A-Z]": "123",
    "[0-9]": "xyz",
  };

  for (let i = 0; i < count; i++) {
    if (generated.length > 0) {
      // Take a valid input and corrupt it
      const valid = generated[i % generated.length];
      const corrupted = corrupt(valid);
      inputs.push(corrupted);
    } else {
      // Use generic invalid strings
      inputs.push(["___", "!!!", "   ", "", "null"][i % 5]);
    }
  }

  // Also add pattern-specific negations
  for (const [key, val] of Object.entries(negations)) {
    if (pattern.includes(key) && inputs.length < count * 2) {
      inputs.push(val);
    }
  }

  return inputs.slice(0, count);
}

function corrupt(input: string): string {
  if (input.length === 0) return "!";
  const chars = input.split("");
  const idx = Math.floor(Math.random() * chars.length);
  const replacements = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];
  chars[idx] = replacements[Math.floor(Math.random() * replacements.length)];
  return chars.join("");
}

function expandPattern(pattern: string): string[] {
  const results: string[] = [];
  let current = "";

  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i];

    // Anchors — skip
    if (char === "^" || char === "$") {
      i++;
      continue;
    }

    // Escaped sequences
    if (char === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const replacements: Record<string, string> = {
        d: "5",
        D: "x",
        w: "a",
        W: "!",
        s: " ",
        S: "a",
        b: "",
        n: "\n",
        t: "\t",
        r: "\r",
      };
      current += replacements[next] || next;
      i += 2;
      continue;
    }

    // Character classes
    if (char === "[") {
      let j = i + 1;
      let negated = false;
      if (pattern[j] === "^") {
        negated = true;
        j++;
      }
      const classStart = j;
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      const classContent = pattern.slice(classStart, j);
      const firstChar = classContent[0] || "a";

      // Handle ranges like a-z
      const rangeMatch = classContent.match(/(\w)-(\w)/);
      if (rangeMatch && !negated) {
        current += rangeMatch[1];
      } else if (!negated) {
        current += firstChar;
      } else {
        // Negated class — use a char NOT in the class
        current += "!";
      }
      i = j + 1;
      continue;
    }

    // Groups
    if (char === "(") {
      let depth = 1;
      let j = i + 1;
      // Skip non-capturing/lookahead prefixes
      if (pattern[j] === "?") j += 2;
      const groupStart = j;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === "(") depth++;
        if (pattern[j] === ")") depth--;
        if (pattern[j] === "\\") j++;
        j++;
      }
      const groupContent = pattern.slice(groupStart, j - 1);

      // Try to expand group content
      const groupResult = expandPattern(groupContent);
      if (groupResult.length > 0) {
        current += groupResult[0];
      }
      i = j;
      continue;
    }

    // Alternation
    if (char === "|") {
      results.push(current);
      current = "";
      i++;
      continue;
    }

    // Quantifiers
    if (char === "*") {
      // 0 or more — add 0 and 3 copies of previous
      const prev = current.slice(-1);
      current += prev + prev + prev;
      results.push(current.slice(0, -3)); // 0 copies version
      i++;
      continue;
    }
    if (char === "+") {
      // 1 or more — add 3 copies
      const prev = current.slice(-1);
      current += prev + prev + prev;
      i++;
      continue;
    }
    if (char === "?") {
      // 0 or 1 — keep as is (1 copy)
      i++;
      continue;
    }
    if (char === "{") {
      let j = i;
      while (j < pattern.length && pattern[j] !== "}") j++;
      const quantContent = pattern.slice(i + 1, j);
      const rangeMatch = quantContent.match(/^(\d+)(?:,(\d*))?$/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const prev = current.slice(-1);
        for (let k = 1; k < min; k++) {
          current += prev;
        }
      }
      i = j + 1;
      continue;
    }

    // Wildcard
    if (char === ".") {
      current += "a";
      i++;
      continue;
    }

    // Literal
    current += char;
    i++;
  }

  results.push(current);

  return results.filter((r) => r.length > 0 || pattern.includes("*"));
}
