"use client";

import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Flag, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DebugResponse } from "@/types";

interface RegexEditorProps {
  onResults?: (results: DebugResponse & { redosWarning: boolean; complexity: string }) => void;
  onPatternChange?: (pattern: string) => void;
  onTestStringChange?: (testString: string) => void;
  initialPattern?: string;
  initialTestString?: string;
}

export default function RegexEditor({ onResults, onPatternChange, onTestStringChange, initialPattern = "", initialTestString = "" }: RegexEditorProps) {
  const [pattern, setPattern] = useState(initialPattern);
  const [testString, setTestString] = useState(initialTestString);
  const [flags, setFlags] = useState("g");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<(DebugResponse & { redosWarning: boolean; complexity: string }) | null>(null);

  // Listen for external pattern set events (from cheatsheet)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPattern(detail);
      onPatternChange?.(detail);
    };
    window.addEventListener("setPattern", handler);
    return () => window.removeEventListener("setPattern", handler);
  }, [onPatternChange]);

  const handlePatternChange = (value: string) => {
    setPattern(value);
    onPatternChange?.(value);
  };

  const handleTestStringChange = (value: string) => {
    setTestString(value);
    onTestStringChange?.(value);
  };

  const handleDebug = useCallback(async () => {
    if (!pattern) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern, testString, flags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Debug failed");
      setResults(data);
      onResults?.(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [pattern, testString, flags, onResults]);

  // Auto-run on change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pattern) handleDebug();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, testString, flags]);

  const renderHighlightedString = () => {
    if (!results || !results.matches || results.matches.length === 0) {
      return (
        <span className="font-mono text-sm text-muted-foreground whitespace-pre-wrap break-all">
          {testString || "Test string output will appear here..."}
        </span>
      );
    }

    const chars = testString.split("");
    const matchRanges: { start: number; end: number; matchIdx: number }[] = [];
    results.matches.forEach((m, i) => {
      matchRanges.push({ start: m.index, end: m.index + m.match.length, matchIdx: i });
    });

    return (
      <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
        {chars.map((char, i) => {
          const range = matchRanges.find((r) => i >= r.start && i < r.end);
          const colors = [
            "bg-purple-500/30 text-purple-200",
            "bg-blue-500/30 text-blue-200",
            "bg-green-500/30 text-green-200",
            "bg-orange-500/30 text-orange-200",
            "bg-pink-500/30 text-pink-200",
          ];
          if (range) {
            return (
              <span key={i} className={cn("rounded px-0.5", colors[range.matchIdx % colors.length])}>
                {char}
              </span>
            );
          }
          return <span key={i} className="text-muted-foreground">{char}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Pattern Editor */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-purple-400" />
              Regular Expression
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Flags:</span>
              <Input
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="h-8 w-20 font-mono text-xs"
                placeholder="g"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-2">
            <div className="flex items-center pl-3 text-muted-foreground font-mono text-sm">/</div>
            <div className="flex-1 h-20 min-h-[80px] border border-input rounded-md overflow-hidden">
              <Editor
                value={pattern}
                onChange={(value) => handlePatternChange(value || "")}}
                language="regex"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 8, bottom: 8 },
                  renderLineHighlight: "none",
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                }}
              />
            </div>
            <div className="flex items-center pr-3 text-muted-foreground font-mono text-sm">/{flags}</div>
            <Button
              variant="gradient"
              size="default"
              onClick={handleDebug}
              disabled={loading || !pattern}
              className="self-stretch"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test String Input */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Test String</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={testString}
            onChange={(e) => handleTestStringChange(e.target.value)}
            className="w-full min-h-[100px] resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter your test string here..."
          />
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Match Results</CardTitle>
            {results && (
              <div className="flex items-center gap-2">
                {results.redosWarning && (
                  <Badge variant="danger">⚠ ReDoS Risk: {results.complexity}</Badge>
                )}
                <Badge variant="secondary">
                  {results.matches.length} match{results.matches.length !== 1 ? "es" : ""}
                </Badge>
                <Badge variant="outline">
                  {results.executionTime.toFixed(2)}ms
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          ) : (
            <div className="rounded-md border border-input bg-background/50 p-4 min-h-[80px]">
              {renderHighlightedString()}
            </div>
          )}

          {/* Match details */}
          {results && results.matches.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Match Details</h4>
              <div className="space-y-1">
                {results.matches.map((match, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono">#{i + 1}</Badge>
                    <span className="font-mono text-green-400">"{match.match}"</span>
                    <span className="text-xs text-muted-foreground">at position {match.index}</span>
                    {match.groups.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({match.groups.length} group{match.groups.length !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
