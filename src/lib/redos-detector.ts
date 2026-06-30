import type { RedosResult } from "@/types";

/**
 * ReDoS (Regular Expression Denial of Service) detector.
 * Analyzes regex patterns for catastrophic backtracking vulnerabilities.
 */

interface PatternSegment {
  content: string;
  quantifier?: string;
  start: number;
  end: number;
}

export function detectRedos(pattern: string): RedosResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 1. Check for nested quantifiers: (a+)+ or (a*)*
  const nestedQuantifierPattern = /\(([^)]+[+*?][^)]*)\)[+*?{]/;
  if (nestedQuantifierPattern.test(pattern)) {
    issues.push("Nested quantifiers detected: e.g., (a+)+ or (a*)*");
    suggestions.push("Replace nested quantifiers with a single quantifier or use possessive quantifiers if available");
  }

  // 2. Check for overlapping alternation with quantifier: (a|a)*
  const overlapPattern = /\(([^)]+)\)[+*?{]/;
  const overlapMatch = pattern.match(overlapPattern);
  if (overlapMatch) {
    const alternatives = overlapMatch[1].split("|").map((s) => s.trim());
    // Check if any two alternatives can match the same string
    for (let i = 0; i < alternatives.length; i++) {
      for (let j = i + 1; j < alternatives.length; j++) {
        if (canOverlap(alternatives[i], alternatives[j])) {
          issues.push(`Overlapping alternatives in quantified group: "${alternatives[i]}" and "${alternatives[j]}" can match same input`);
          suggestions.push(`Make alternatives mutually exclusive, or remove the outer quantifier`);
        }
      }
    }
  }

  // 3. Check for (a|ab)* type patterns
  const prefixPattern = /\(([^)]+)\)[+*?]/;
  const prefixMatch = pattern.match(prefixPattern);
  if (prefixMatch) {
    const alts = prefixMatch[1].split("|").map((s) => s.trim());
    for (let i = 0; i < alts.length; i++) {
      for (let j = 0; j < alts.length; j++) {
        if (i !== j && alts[j].startsWith(alts[i]) && alts[i].length > 0) {
          issues.push(`Prefix ambiguity: "${alts[i]}" is a prefix of "${alts[j]}" inside a quantified group`);
          suggestions.push(`Reorder alternatives (longest first) or make them mutually exclusive`);
        }
      }
    }
  }

  // 4. Check for .*.*/ or .+ .+ greedy patterns
  const greedyWildcard = /\.(?:\*|\+)\s*.*\.(?:\*|\+)/;
  if (greedyWildcard.test(pattern)) {
    issues.push("Multiple greedy wildcard quantifiers (.*) can cause excessive backtracking");
    suggestions.push("Use specific character classes instead of wildcards, or use lazy quantifiers (.*?)");
  }

  // 5. Check for quantified groups with optional content: (a?)+ or (a?)*
  const optionalQuantified = /\(([^)]*\?[^)]*)\)[+*{]/;
  if (optionalQuantified.test(pattern)) {
    issues.push("Quantified group with optional content detected: e.g., (a?)+");
    suggestions.push("Optional content inside a quantified group can cause exponential backtracking");
  }

  // 6. Check for \w*\w* or similar
  const repeatedClass = /(\\[wdDsS])[+*]\1[+*]/;
  if (repeatedClass.test(pattern)) {
    issues.push("Repeated character class quantifiers detected: e.g., \\w*\\w*");
    suggestions.push("Combine into a single quantifier or use atomic groups");
  }

  // Determine complexity
  let complexity: RedosResult["complexity"] = "O(n)";
  if (issues.length === 0) {
    complexity = "O(n)";
  } else if (issues.length === 1 && issues[0].includes("Nested")) {
    complexity = "O(2ⁿ)";
  } else if (issues.length >= 2) {
    complexity = "O(2ⁿ)";
  } else if (issues.length === 1 && (issues[0].includes("overlapping") || issues[0].includes("Prefix"))) {
    complexity = "O(n²)";
  } else {
    complexity = "O(n²)";
  }

  // Build explanation
  let explanation: string;
  if (issues.length === 0) {
    explanation = "No catastrophic backtracking patterns detected. This regex should execute in linear time.";
  } else {
    explanation = `Detected ${issues.length} potential ReDoS vulnerability pattern(s). `;
    explanation += `Estimated worst-case complexity: ${complexity}. `;
    explanation += `See suggestions below for remediation.`;
  }

  if (suggestions.length === 0 && issues.length === 0) {
    suggestions.push("No changes needed — pattern appears safe.");
  }

  return {
    isVulnerable: issues.length > 0,
    complexity,
    patterns: issues,
    explanation,
    suggestions,
  };
}

function canOverlap(a: string, b: string): boolean {
  // Simplified check: if both can match an empty string or share a common prefix
  if (a === b) return true;
  if (a === "" || b === "") return true;

  // Check if both can match at least one common character
  const aChars = expandToChars(a);
  const bChars = expandToChars(b);
  return aChars.some((c) => bChars.includes(c));
}

function expandToChars(pattern: string): string[] {
  const chars: string[] = [];

  // Simple expansion for common patterns
  if (pattern === ".") return "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  if (pattern === "\\d") return "0123456789".split("");
  if (pattern === "\\w") return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_".split("");
  if (pattern === "\\s") return [" ", "\t", "\n", "\r"];
  if (pattern.length === 1) return [pattern];

  // For character classes like [a-z]
  const classMatch = pattern.match(/^\[([^\]]+)\]$/);
  if (classMatch) {
    const content = classMatch[1];
    const rangeMatch = content.match(/(\w)-(\w)/);
    if (rangeMatch) {
      const start = rangeMatch[1].charCodeAt(0);
      const end = rangeMatch[2].charCodeAt(0);
      for (let i = start; i <= end; i++) {
        chars.push(String.fromCharCode(i));
      }
    }
    return chars.length > 0 ? chars : content.split("");
  }

  // Default: return first char
  return [pattern[0]];
}
