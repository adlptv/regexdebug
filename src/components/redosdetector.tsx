"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RedosResult } from "@/types";

interface RedosDetectorProps {
  pattern: string;
}

export default function RedosDetector({ pattern }: RedosDetectorProps) {
  const [result, setResult] = useState<RedosResult | null>(null);
  const [loading, setLoading] = useState(false);

  const checkRedos = useCallback(async () => {
    if (!pattern) return;
    setLoading(true);
    try {
      const res = await fetch("/api/redos-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pattern]);

  // Auto-check on pattern change with debounce
  useEffect(() => {
    if (!pattern) {
      setResult(null);
      return;
    }
    const timer = setTimeout(() => checkRedos(), 300);
    return () => clearTimeout(timer);
  }, [pattern, checkRedos]);

  const complexityColor: Record<string, string> = {
    "O(n)": "text-green-400",
    "O(n²)": "text-yellow-400",
    "O(n³)": "text-orange-400",
    "O(2ⁿ)": "text-red-400",
    "O(n^k)": "text-red-400",
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-400" />
          ReDoS Detector
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Analyzing pattern...
          </div>
        ) : !result ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Enter a pattern to check for ReDoS vulnerabilities
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status banner */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4",
                result.isVulnerable
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-green-500/30 bg-green-500/10"
              )}
            >
              {result.isVulnerable ? (
                <AlertTriangle className="h-6 w-6 shrink-0 text-red-400" />
              ) : (
                <ShieldCheck className="h-6 w-6 shrink-0 text-green-400" />
              )}
              <div className="flex-1">
                <div className={cn("font-semibold", result.isVulnerable ? "text-red-400" : "text-green-400")}>
                  {result.isVulnerable ? "Vulnerable to ReDoS" : "No ReDoS detected"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.explanation}
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Worst-case complexity:</span>
              <Badge
                variant={result.isVulnerable ? "danger" : "success"}
                className={cn("font-mono text-base", complexityColor[result.complexity])}
              >
                {result.complexity}
              </Badge>
            </div>

            {/* Detected patterns */}
            {result.patterns.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Detected Patterns
                </h4>
                <ul className="space-y-1">
                  {result.patterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 text-red-400">▸</span>
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Suggestions
              </h4>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 text-blue-400">💡</span>
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
