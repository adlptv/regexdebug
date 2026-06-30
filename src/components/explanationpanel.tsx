"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExplanationToken } from "@/types";

interface ExplanationPanelProps {
  pattern: string;
}

const tokenColors: Record<string, string> = {
  literal: "border-transparent bg-muted text-foreground",
  meta: "border-transparent bg-purple-500/20 text-purple-300",
  quantifier: "border-transparent bg-blue-500/20 text-blue-300",
  group: "border-transparent bg-green-500/20 text-green-300",
  charclass: "border-transparent bg-orange-500/20 text-orange-300",
  anchor: "border-transparent bg-yellow-500/20 text-yellow-300",
  escape: "border-transparent bg-pink-500/20 text-pink-300",
  alternation: "border-transparent bg-cyan-500/20 text-cyan-300",
  wildcard: "border-transparent bg-indigo-500/20 text-indigo-300",
  flag: "border-transparent bg-red-500/20 text-red-300",
};

const typeIcons: Record<string, string> = {
  literal: "Aa",
  escape: "\\",
  quantifier: "*+?",
  group: "( )",
  charclass: "[ ]",
  anchor: "^$",
  alternation: "|",
  wildcard: ".",
  flag: "gim",
};

export default function ExplanationPanel({ pattern }: ExplanationPanelProps) {
  const [tokens, setTokens] = useState<ExplanationToken[]>([]);
  const [loading, setLoading] = useState(false);

  const explain = useCallback(async () => {
    if (!pattern) {
      setTokens([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern }),
      });
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pattern]);

  useEffect(() => {
    const timer = setTimeout(() => explain(), 300);
    return () => clearTimeout(timer);
  }, [explain]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-pink-400" />
          Explanation Mode
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Analyzing pattern...
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Enter a pattern to see a detailed explanation of each token
          </div>
        ) : (
          <div className="space-y-2">
            {/* Pattern with annotated tokens */}
            <div className="flex flex-wrap gap-1 rounded-lg border border-input bg-background/50 p-3 mb-3">
              {tokens.map((token, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative"
                >
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-sm cursor-help",
                      tokenColors[token.type] || "bg-muted"
                    )}
                  >
                    {token.token}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Token-by-token explanation */}
            <div className="space-y-1.5">
              {tokens.map((token, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono w-6">{i + 1}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-xs",
                        tokenColors[token.type] || "bg-muted"
                      )}
                    >
                      {token.token}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{token.description}</div>
                    {token.example && (
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        e.g., {token.example}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {token.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
