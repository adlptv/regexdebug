import type { ExplanationToken } from "@/types";

/**
 * Regex pattern explainer — generates per-token annotations
 * to help users understand what each part of their regex does.
 */

export function explainPattern(pattern: string): ExplanationToken[] {
  const tokens: ExplanationToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    // Escaped sequences
    if (char === "\\" && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      const explanations: Record<string, { desc: string; ex?: string }> = {
        d: { desc: "Matches any digit (0-9)", ex: "5, 3, 0" },
        D: { desc: "Matches any non-digit character", ex: "a, !, space" },
        w: { desc: "Matches any word character (a-z, A-Z, 0-9, underscore)", ex: "a, Z, 5, _" },
        W: { desc: "Matches any non-word character", ex: "!, @, space" },
        s: { desc: "Matches any whitespace character", ex: "space, tab, newline" },
        S: { desc: "Matches any non-whitespace character", ex: "a, 1, !" },
        b: { desc: "Word boundary — position between a word char and non-word char", ex: "Position between 'a' and ' '" },
        B: { desc: "Non-word boundary — position between two word chars or two non-word chars", ex: "Position between 'a' and 'b'" },
        n: { desc: "Matches a newline character", ex: "\\n" },
        t: { desc: "Matches a tab character", ex: "\\t" },
        r: { desc: "Matches a carriage return character", ex: "\\r" },
        ".": { desc: "Matches a literal dot character", ex: "." },
        "\\": { desc: "Matches a literal backslash character", ex: "\\" },
        "/": { desc: "Matches a literal forward slash", ex: "/" },
        "(": { desc: "Matches a literal opening parenthesis", ex: "(" },
        ")": { desc: "Matches a literal closing parenthesis", ex: ")" },
        "[": { desc: "Matches a literal opening bracket", ex: "[" },
        "]": { desc: "Matches a literal closing bracket", ex: "]" },
        "{": { desc: "Matches a literal opening brace", ex: "{" },
        "}": { desc: "Matches a literal closing brace", ex: "}" },
        "+": { desc: "Matches a literal plus sign", ex: "+" },
        "*": { desc: "Matches a literal asterisk", ex: "*" },
        "?": { desc: "Matches a literal question mark", ex: "?" },
        "|": { desc: "Matches a literal pipe character", ex: "|" },
        "^": { desc: "Matches a literal caret character", ex: "^" },
        "$": { desc: "Matches a literal dollar sign", ex: "$" },
      };

      // Hex and unicode escapes
      if (next === "x" && i + 3 < pattern.length) {
        const hex = pattern.slice(i + 2, i + 4);
        tokens.push({
          token: `\\x${hex}`,
          type: "escape",
          description: `Matches the character with hex code ${hex} (${String.fromCharCode(parseInt(hex, 16))})`,
          example: String.fromCharCode(parseInt(hex, 16)),
        });
        i += 4;
        continue;
      }

      if (next === "u" && i + 5 < pattern.length) {
        const unicode = pattern.slice(i + 2, i + 6);
        tokens.push({
          token: `\\u${unicode}`,
          type: "escape",
          description: `Matches the Unicode character U+${unicode.toUpperCase()} (${String.fromCharCode(parseInt(unicode, 16))})`,
          example: String.fromCharCode(parseInt(unicode, 16)),
        });
        i += 6;
        continue;
      }

      // Named backreference
      if (next === "k" && pattern[i + 2] === "<") {
        let j = i + 3;
        while (j < pattern.length && pattern[j] !== ">") j++;
        const name = pattern.slice(i + 3, j);
        tokens.push({
          token: `\\k<${name}>`,
          type: "escape",
          description: `Backreference to named group "${name}" — matches the same text captured by that group`,
          example: `If group "${name}" matched "abc", this matches "abc" again`,
        });
        i = j + 1;
        continue;
      }

      // Numbered backreference
      if (/\d/.test(next)) {
        let j = i + 1;
        while (j < pattern.length && /\d/.test(pattern[j])) j++;
        const num = pattern.slice(i + 1, j);
        tokens.push({
          token: `\\${num}`,
          type: "escape",
          description: `Backreference to group #${num} — matches the same text captured by that group`,
          example: `If group #${num} matched "abc", this matches "abc" again`,
        });
        i = j;
        continue;
      }

      const info = explanations[next] || { desc: `Escaped character '${next}'` };
      tokens.push({
        token: `\\${next}`,
        type: "escape",
        description: info.desc,
        example: info.ex,
      });
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
      const classStart = j;
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      const classContent = pattern.slice(classStart, j);
      const fullToken = pattern.slice(i, j + 1);

      let desc = `Character class matching any of: ${classContent}`;
      if (negated) {
        desc = `Negated character class — matches any character NOT in: ${classContent}`;
      }

      // Special cases
      if (classContent === "a-z") {
        desc = negated ? "Matches any character except lowercase letters a-z" : "Matches any lowercase letter (a-z)";
      } else if (classContent === "A-Z") {
        desc = negated ? "Matches any character except uppercase letters A-Z" : "Matches any uppercase letter (A-Z)";
      } else if (classContent === "0-9") {
        desc = negated ? "Matches any character except digits 0-9" : "Matches any digit (0-9)";
      } else if (classContent === "a-zA-Z") {
        desc = negated ? "Matches any non-alphabetic character" : "Matches any letter (a-z or A-Z)";
      } else if (classContent === "a-zA-Z0-9") {
        desc = negated ? "Matches any non-alphanumeric character" : "Matches any letter or digit";
      }

      tokens.push({
        token: fullToken,
        type: "charclass",
        description: desc,
        example: classContent[0] || "a",
      });
      i = j + 1;
      continue;
    }

    // Groups
    if (char === "(") {
      let j = i + 1;
      let groupType = "capturing group";
      let groupContentStart = i + 1;

      // Check group type
      if (pattern[j] === "?") {
        if (pattern[j + 1] === ":") {
          groupType = "non-capturing group";
          groupContentStart = j + 2;
        } else if (pattern[j + 1] === "=") {
          groupType = "positive lookahead assertion";
          groupContentStart = j + 2;
        } else if (pattern[j + 1] === "!") {
          groupType = "negative lookahead assertion";
          groupContentStart = j + 2;
        } else if (pattern[j + 1] === "<" && pattern[j + 2] === "=") {
          groupType = "positive lookbehind assertion";
          groupContentStart = j + 3;
        } else if (pattern[j + 1] === "<" && pattern[j + 2] === "!") {
          groupType = "negative lookbehind assertion";
          groupContentStart = j + 3;
        } else if (pattern[j + 1] === "<") {
          // Named group
          let nameEnd = j + 2;
          while (nameEnd < pattern.length && pattern[nameEnd] !== ">") nameEnd++;
          const name = pattern.slice(j + 2, nameEnd);
          groupType = `named capturing group "${name}"`;
          groupContentStart = nameEnd + 1;
        }
      }

      let depth = 1;
      let k = groupContentStart;
      while (k < pattern.length && depth > 0) {
        if (pattern[k] === "(") depth++;
        if (pattern[k] === ")") depth--;
        if (pattern[k] === "\\") k++;
        k++;
      }

      const groupContent = pattern.slice(groupContentStart, k - 1);
      const fullToken = pattern.slice(i, k);

      tokens.push({
        token: fullToken,
        type: "group",
        description: `${groupType} containing: ${groupContent}`,
        example: undefined,
      });
      i = k;
      continue;
    }

    // Quantifiers
    if (char === "*") {
      const lazy = pattern[i + 1] === "?";
      tokens.push({
        token: lazy ? "*?" : "*",
        type: "quantifier",
        description: lazy
          ? "Lazy quantifier — matches 0 or more of the preceding element, preferring fewer matches"
          : "Greedy quantifier — matches 0 or more of the preceding element, preferring more matches",
        example: "In 'aaa', a* matches 'aaa'",
      });
      i += lazy ? 2 : 1;
      continue;
    }
    if (char === "+") {
      const lazy = pattern[i + 1] === "?";
      tokens.push({
        token: lazy ? "+?" : "+",
        type: "quantifier",
        description: lazy
          ? "Lazy quantifier — matches 1 or more of the preceding element, preferring fewer matches"
          : "Greedy quantifier — matches 1 or more of the preceding element, preferring more matches",
        example: "In 'aaa', a+ matches 'aaa'",
      });
      i += lazy ? 2 : 1;
      continue;
    }
    if (char === "?") {
      const lazy = pattern[i + 1] === "?";
      tokens.push({
        token: lazy ? "??" : "?",
        type: "quantifier",
        description: lazy
          ? "Lazy quantifier — matches 0 or 1 of the preceding element, preferring 0"
          : "Optional quantifier — matches 0 or 1 of the preceding element",
        example: "In 'color', colou?r matches 'color'",
      });
      i += lazy ? 2 : 1;
      continue;
    }
    if (char === "{") {
      let j = i;
      while (j < pattern.length && pattern[j] !== "}") j++;
      const quantContent = pattern.slice(i, j + 1);
      const rangeMatch = quantContent.match(/\{(\d+)(?:,(\d*))?\}/);

      if (rangeMatch) {
        const min = rangeMatch[1];
        const max = rangeMatch[2];
        let desc: string;
        if (max === undefined) {
          desc = `Matches exactly ${min} of the preceding element`;
        } else if (max === "") {
          desc = `Matches at least ${min} of the preceding element`;
        } else {
          desc = `Matches between ${min} and ${max} of the preceding element`;
        }
        tokens.push({
          token: quantContent,
          type: "quantifier",
          description: desc,
          example: `a{${min}${max ? "," + max : ""}}`,
        });
      } else {
        tokens.push({
          token: quantContent,
          type: "literal",
          description: `Literal text: ${quantContent}`,
        });
      }
      i = j + 1;
      continue;
    }

    // Anchors
    if (char === "^") {
      tokens.push({
        token: "^",
        type: "anchor",
        description: "Start of string anchor — asserts position at the beginning of the string (or line in multiline mode)",
        example: "^Hello matches 'Hello' only at the start",
      });
      i++;
      continue;
    }
    if (char === "$") {
      tokens.push({
        token: "$",
        type: "anchor",
        description: "End of string anchor — asserts position at the end of the string (or line in multiline mode)",
        example: "world$ matches 'world' only at the end",
      });
      i++;
      continue;
    }

    // Alternation
    if (char === "|") {
      tokens.push({
        token: "|",
        type: "alternation",
        description: "Alternation (OR) — matches the expression before or after the pipe",
        example: "cat|dog matches 'cat' or 'dog'",
      });
      i++;
      continue;
    }

    // Wildcard
    if (char === ".") {
      tokens.push({
        token: ".",
        type: "wildcard",
        description: "Wildcard — matches any single character except newline (unless DOTALL flag is set)",
        example: "a.c matches 'abc', 'a1c', 'a c'",
      });
      i++;
      continue;
    }

    // Literal
    tokens.push({
      token: char,
      type: "literal",
      description: `Literal character '${char}'`,
      example: char,
    });
    i++;
  }

  return tokens;
}
