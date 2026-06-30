"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GeneratedTest } from "@/types";

interface TestGeneratorProps {
  pattern: string;
}

export default function TestGenerator({ pattern }: TestGeneratorProps) {
  const [tests, setTests] = useState<GeneratedTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(5);

  const generate = useCallback(async () => {
    if (!pattern) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern, count }),
      });
      const data = await res.json();
      setTests(data.tests || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pattern, count]);

  useEffect(() => {
    if (pattern) {
      const timer = setTimeout(() => generate(), 500);
      return () => clearTimeout(timer);
    }
  }, [pattern, generate]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-green-400" />
            Test Case Generator
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={loading || !pattern}
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Regenerate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {pattern ? "Generating test cases..." : "Enter a pattern to generate tests"}
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map((test, i) => {
              const passed = test.shouldMatch === test.actualMatch;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                  )}
                >
                  {passed ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm truncate">
                      "{test.input}"
                    </div>
                    {test.matchValue && (
                      <div className="text-xs text-muted-foreground font-mono">
                        Matched: "{test.matchValue}"
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={test.shouldMatch ? "success" : "outline"}>
                      Should: {test.shouldMatch ? "match" : "no match"}
                    </Badge>
                    <Badge variant={test.actualMatch ? "success" : "danger"}>
                      Got: {test.actualMatch ? "match" : "no match"}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
