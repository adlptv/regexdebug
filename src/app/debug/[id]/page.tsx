"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import RegexEditor from "@/components/RegexEditor";
import StepDebugger from "@/components/StepDebugger";
import RedosDetector from "@/components/RedosDetector";
import ExplanationPanel from "@/components/ExplanationPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function DebugSessionPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/sessions/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Session not found");
          return res.json();
        })
        .then((data) => setSession(data.session))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-muted-foreground">{error || "Session not found"}</p>
        <Link href="/sessions">
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/sessions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(session.createdAt)}
              </span>
              {session.redosWarning ? (
                <Badge variant="danger">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  ReDoS: {session.complexity}
                </Badge>
              ) : (
                <Badge variant="success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Safe: {session.complexity}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pattern</span>
                <code className="block mt-1 rounded-md border border-input bg-background/50 p-3 font-mono text-sm text-green-400">
                  /{session.pattern}/
                </code>
              </div>
              {session.testString && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Test String</span>
                  <code className="block mt-1 rounded-md border border-input bg-background/50 p-3 font-mono text-sm">
                    {session.testString}
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <RegexEditor
            initialPattern={session.pattern}
            initialTestString={session.testString}
          />
          <StepDebugger
            pattern={session.pattern}
            testString={session.testString}
          />
          <RedosDetector pattern={session.pattern} />
          <ExplanationPanel pattern={session.pattern} />
        </div>
      </motion.div>
    </div>
  );
}
