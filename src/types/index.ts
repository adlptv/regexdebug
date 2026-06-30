export interface DebugStep {
  type: "start" | "match" | "fail" | "backtrack" | "group-start" | "group-end" | "quantifier" | "anchor" | "char" | "wildcard" | "charclass" | "complete";
  position: number;
  regexIndex: number;
  description: string;
  currentMatch?: string;
  groups?: { name?: string; index: number; value: string; start: number; end: number }[];
  isBacktracking?: boolean;
}

export interface MatchResult {
  match: string;
  index: number;
  groups: { name?: string; index: number; value: string; start: number; end: number }[];
}

export interface DebugResponse {
  steps: DebugStep[];
  matches: MatchResult[];
  totalSteps: number;
  executionTime: number;
  error?: string;
}

export interface RedosResult {
  isVulnerable: boolean;
  complexity: "O(n)" | "O(n²)" | "O(2ⁿ)" | "O(n³)" | "O(n^k)";
  patterns: string[];
  explanation: string;
  suggestions: string[];
}

export interface GeneratedTest {
  input: string;
  shouldMatch: boolean;
  actualMatch: boolean;
  matchValue?: string;
}

export interface ExplanationToken {
  token: string;
  type: "literal" | "meta" | "quantifier" | "group" | "charclass" | "anchor" | "escape" | "alternation" | "flag";
  description: string;
  example?: string;
}

export interface Session {
  id: string;
  name: string;
  pattern: string;
  testString: string;
  engine: string;
  steps: DebugStep[];
  captures: { name?: string; index: number; value: string; start: number; end: number }[];
  redosWarning: boolean;
  complexity: string;
  createdAt: string;
}

export interface ShareableLinkData {
  id: string;
  token: string;
  sessionId: string;
  expiresAt: string | null;
  session: Session;
}

export interface CheatsheetPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}
