# RegexDebug — Step-by-Step Regex Debugger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

A regex debugger that visualizes backtracking step by step. Detects catastrophic backtracking patterns, auto-generates test cases from your pattern, and explains each token — useful for teaching and debugging.

## Screenshots

| Landing Page (Playground) | Debugger (ReDoS + Groups) |
|:---:|:---:|
| ![Debugger: ReDoS warning, capture group explorer, and test case generator](screenshots/dashboard.png) |

## Features

- Step-by-step backtracking visualization: see every character match, group capture, and backtrack
- ReDoS detector: identifies nested quantifiers, overlapping alternations, and greedy wildcards with complexity estimates
- Auto-generates valid and invalid test strings from your pattern
- Capture group explorer: view groups captured at each step
- Per-token explanation mode: describes what each part of the pattern does
- Shareable sessions: save a debug session and share the URL
- Monaco Editor for pattern and test string input
- Performance comparison across input sizes

## Quick Start

```bash
git clone https://github.com/adlptv/regexdebug.git
cd regexdebug
pnpm install
pnpm dev
```

Or:
```bash
docker-compose up
```

## Architecture

```
apps/regexdebug/
├── src/app/          # Pages: landing, playground, debug/[id], sessions, settings
│   └── api/          # debug, redos-check, generate-tests, explain, sessions, health
├── src/components/   # RegexEditor, StepDebugger, RedosDetector, TestGenerator, CaptureExplorer, ExplanationPanel, UI primitives
├── src/lib/          # regex-engine (step tracker), redos-detector, test-generator, explainer, validators (Zod)
├── prisma/           # SQLite: Session, ShareableLink
└── tests/            # Vitest + Playwright
```

## ReDoS Detection Patterns

| Pattern | Example | Complexity |
|---------|---------|------------|
| Nested quantifiers | (a+)+ | O(2ⁿ) |
| Overlapping alternation | (a|a)+ | O(2ⁿ) |
| Prefix ambiguity | .*x | O(n²) |
| Greedy wildcard | .*.* | O(n²) |

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/debug | Execute regex with step tracking |
| POST | /api/redos-check | Check pattern for backtracking risks |
| POST | /api/generate-tests | Generate test cases from pattern |
| POST | /api/explain | Generate per-token explanation |
| GET/POST | /api/sessions | List or save debug sessions |
| GET/DELETE | /api/sessions/[id] | Get or delete a session |
| GET | /api/sessions/[id]/share | Get shareable link |
| GET | /api/health | Health check |

## Security

- Zod validation on all routes
- Rate limiting
- Input size limits on server-side regex execution
- Execution timeout with ReDoS protection
- Helmet.js headers

## License

MIT