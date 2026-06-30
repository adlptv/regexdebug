"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import RegexEditor from "@/components/RegexEditor";
import StepDebugger from "@/components/StepDebugger";
import RedosDetector from "@/components/RedosDetector";
import TestGenerator from "@/components/TestGenerator";
import CaptureGroupExplorer from "@/components/CaptureGroupExplorer";
import ExplanationPanel from "@/components/ExplanationPanel";
import PerformanceGraph from "@/components/PerformanceGraph";
import CheatsheetSidebar from "@/components/CheatsheetSidebar";
import ShareButton from "@/components/ShareButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DebugResponse, MatchResult } from "@/types";

export default function PlaygroundPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [debugData, setDebugData] = useState<(DebugResponse & { redosWarning: boolean; complexity: string }) | null>(null);

  const handleResults = useCallback((results: DebugResponse & { redosWarning: boolean; complexity: string }) => {
    setDebugData(results);
    setMatches(results.matches || []);
  }, []);

  // RegexEditor syncs pattern and testString via callbacks
  const activePattern = pattern;
  const activeTestString = testString;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Regex Playground</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Debug, test, and analyze your regular expressions with powerful tools
            </p>
          </div>
          <ShareButton
            pattern={activePattern}
            testString={activeTestString}
            redosWarning={debugData?.redosWarning}
            complexity={debugData?.complexity}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <RegexEditor
            onResults={handleResults}
            onPatternChange={setPattern}
            onTestStringChange={setTestString}
          />

          <Tabs defaultValue="debugger" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="debugger">Step Debug</TabsTrigger>
              <TabsTrigger value="redos">ReDoS</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="explain">Explain</TabsTrigger>
            </TabsList>

            <TabsContent value="debugger">
              <StepDebugger
                pattern={activePattern}
                testString={activeTestString}
              />
            </TabsContent>

            <TabsContent value="redos">
              <RedosDetector pattern={activePattern} />
            </TabsContent>

            <TabsContent value="tests">
              <TestGenerator pattern={activePattern} />
            </TabsContent>

            <TabsContent value="groups">
              <CaptureGroupExplorer matches={matches} />
            </TabsContent>

            <TabsContent value="explain">
              <ExplanationPanel pattern={activePattern} />
            </TabsContent>
          </Tabs>

          <PerformanceGraph
            pattern={activePattern}
            testString={activeTestString}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <CheatsheetSidebar onSelect={(p) => {
              // We need a way to set the pattern in RegexEditor
              // For now we use a custom event
              window.dispatchEvent(new CustomEvent("setPattern", { detail: p }));
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
