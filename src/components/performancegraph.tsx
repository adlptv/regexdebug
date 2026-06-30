"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PerformanceGraphProps {
  pattern: string;
  testString: string;
}

interface DataPoint {
  size: number;
  time: number;
}

export default function PerformanceGraph({ pattern, testString }: PerformanceGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxTime, setMaxTime] = useState(0);

  const runBenchmark = useCallback(async () => {
    if (!pattern || !testString) return;
    setLoading(true);

    // Run client-side benchmark
    const sizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    const results: DataPoint[] = [];

    for (const mult of sizes) {
      const input = testString.repeat(Math.min(mult, Math.ceil(10000 / (testString.length || 1))));
      if (input.length > 10000) continue;

      // Measure execution time
      const start = performance.now();
      try {
        const regex = new RegExp(pattern, "g");
        let match: RegExpExecArray | null;
        while ((match = regex.exec(input)) !== null) {
          if (match[0] === "") regex.lastIndex++;
        }
      } catch {
        // ignore
      }
      const time = performance.now() - start;
      results.push({ size: input.length, time });
    }

    setData(results);
    setMaxTime(Math.max(...results.map((r) => r.time), 1));
    setLoading(false);
  }, [pattern, testString]);

  // Determine complexity from data
  const determineComplexity = (): string => {
    if (data.length < 3) return "—";
    const small = data[Math.floor(data.length * 0.2)]?.time || 0;
    const medium = data[Math.floor(data.length * 0.5)]?.time || 0;
    const large = data[data.length - 1]?.time || 0;
    const ratio1 = small > 0 ? medium / small : 0;
    const ratio2 = medium > 0 ? large / medium : 0;

    if (large > 1000) return "O(2ⁿ) — Exponential";
    if (ratio2 > 10) return "O(n²) — Quadratic";
    if (ratio2 > 3) return "O(n log n) — Linearithmic";
    return "O(n) — Linear";
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            Performance Graph
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runBenchmark}
            disabled={loading || !pattern || !testString}
          >
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {loading ? "Running benchmark..." : "Click Run to benchmark regex performance across input sizes"}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Complexity badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estimated complexity:</span>
              <Badge variant={determineComplexity().includes("O(n)") && !determineComplexity().includes("²") && !determineComplexity().includes("2ⁿ") ? "success" : "danger"}>
                {determineComplexity()}
              </Badge>
            </div>

            {/* SVG Chart */}
            <div className="relative h-48 w-full">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.2"
                    className="text-muted-foreground/30"
                  />
                ))}

                {/* Line chart */}
                <motion.polyline
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  points={data
                    .map((d, i) => {
                      const x = (i / (data.length - 1)) * 100;
                      const y = 100 - (d.time / maxTime) * 90;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* Data points */}
                {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 100 - (d.time / maxTime) * 90;
                  return (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="#a855f7"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Input size: {data[0]?.size} → {data[data.length - 1]?.size} chars</span>
              <span>Time: 0ms → {maxTime.toFixed(2)}ms</span>
            </div>

            {/* Data table */}
            <div className="max-h-32 overflow-y-auto rounded-md border border-input">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background/95">
                  <tr className="border-b border-input">
                    <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Input Size</th>
                    <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Time (ms)</th>
                    <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i} className="border-b border-input/30 hover:bg-white/5">
                      <td className="px-3 py-1.5 font-mono">{d.size}</td>
                      <td className="px-3 py-1.5 font-mono">{d.time.toFixed(3)}</td>
                      <td className="px-3 py-1.5 font-mono text-muted-foreground">
                        {i > 0 && data[i - 1].time > 0
                          ? (d.time / data[i - 1].time).toFixed(2) + "x"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
