"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DebugStep } from "@/types";

interface StepDebuggerProps {
  pattern: string;
  testString: string;
  flags?: string;
}

export default function StepDebugger({ pattern, testString, flags = "g" }: StepDebuggerProps) {
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(800);

  const fetchSteps = useCallback(async () => {
    if (!pattern) return;
    setLoading(true);
    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern, testString, flags }),
      });
      const data = await res.json();
      if (data.steps) {
        setSteps(data.steps);
        setCurrentStep(0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [pattern, testString, flags]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  // Auto-play
  useEffect(() => {
    if (!playing || steps.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearTimeout(timer);
  }, [playing, currentStep, steps.length, speed]);

  const step = steps[currentStep];

  const renderVisualization = () => {
    if (!step) return null;
    const chars = testString.split("");

    return (
      <div className="space-y-4">
        {/* String visualization */}
        <div className="flex flex-wrap gap-0.5 rounded-lg border border-input bg-background/50 p-4">
          {chars.length === 0 ? (
            <span className="text-sm text-muted-foreground">No test string</span>
          ) : (
            chars.map((char, i) => {
              const isMatched = step.position !== undefined &&
                step.currentMatch &&
                testString.slice(step.position, step.position + step.currentMatch.length).includes(char) &&
                i >= step.position &&
                i < step.position + (step.currentMatch?.length || 0);
              const isCurrentPos = i === step.position;

              return (
                <motion.span
                  key={i}
                  layout
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded font-mono text-sm border transition-all",
                    isCurrentPos && "bg-yellow-500/30 border-yellow-400 scale-110 z-10",
                    isMatched && !isCurrentPos && "bg-green-500/20 border-green-400",
                    !isCurrentPos && !isMatched && "border-transparent text-muted-foreground",
                    step.isBacktracking && "bg-red-500/20 border-red-400"
                  )}
                >
                  {char === " " ? "␣" : char === "\n" ? "↵" : char === "\t" ? "⇥" : char}
                </motion.span>
              );
            })
          )}
        </div>

        {/* Position indicator */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Position:</span>
          <Badge variant="outline" className="font-mono">{step.position}</Badge>
          <span className="text-muted-foreground">Step:</span>
          <Badge variant="outline" className="font-mono">{currentStep + 1}/{steps.length}</Badge>
          {step.isBacktracking && (
            <Badge variant="danger" className="animate-pulse">↩ Backtracking</Badge>
          )}
        </div>

        {/* Step info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                step.type === "match" && "bg-green-500/20 text-green-400",
                step.type === "fail" && "bg-red-500/20 text-red-400",
                step.type === "backtrack" && "bg-orange-500/20 text-orange-400",
                step.type === "complete" && "bg-blue-500/20 text-blue-400",
                step.type === "start" && "bg-purple-500/20 text-purple-400",
                !["match", "fail", "backtrack", "complete", "start"].includes(step.type) && "bg-muted text-muted-foreground"
              )}>
                {step.type === "match" ? "✓" : step.type === "fail" ? "✗" : step.type === "backtrack" ? "↩" : step.type === "complete" ? "✓" : step.type === "start" ? "▶" : "•"}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {step.type}
                </div>
                <div className="text-sm">{step.description}</div>
                {step.currentMatch && (
                  <div className="mt-1 font-mono text-xs text-green-400">
                    Match: "{step.currentMatch}"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Step Debugger</CardTitle>
          <div className="flex items-center gap-1">
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value={1500}>Slow</option>
              <option value={800}>Normal</option>
              <option value={300}>Fast</option>
              <option value={100}>Turbo</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading steps...
          </div>
        ) : steps.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            Enter a pattern and test string to see step-by-step debugging
          </div>
        ) : (
          <>
            {renderVisualization()}

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => { setPlaying(false); setCurrentStep(0); }}
                disabled={currentStep === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { setPlaying(false); setCurrentStep(Math.max(0, currentStep - 1)); }}
                disabled={currentStep === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={playing ? "destructive" : "gradient"}
                size="default"
                onClick={() => setPlaying(!playing)}
                className="min-w-[100px]"
              >
                {playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {playing ? "Pause" : "Play"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { setPlaying(false); setCurrentStep(Math.min(steps.length - 1, currentStep + 1)); }}
                disabled={currentStep >= steps.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { setPlaying(false); setCurrentStep(steps.length - 1); }}
                disabled={currentStep >= steps.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Step timeline */}
            <div className="flex gap-0.5 overflow-x-auto pb-2">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setPlaying(false); setCurrentStep(i); }}
                  className={cn(
                    "h-6 w-6 shrink-0 rounded text-xs font-mono transition-all",
                    i === currentStep && "bg-primary text-primary-foreground scale-110",
                    i < currentStep && s.type === "match" && "bg-green-500/30",
                    i < currentStep && s.type === "fail" && "bg-red-500/20",
                    i < currentStep && s.type === "backtrack" && "bg-orange-500/20",
                    i < currentStep && !["match", "fail", "backtrack"].includes(s.type) && "bg-muted",
                    i > currentStep && "bg-muted/30"
                  )}
                  title={`Step ${i + 1}: ${s.type}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
