"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Trash2, Bug, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/utils";

interface SessionItem {
  id: string;
  name: string;
  pattern: string;
  testString: string;
  engine: string;
  redosWarning: boolean;
  complexity: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    fetchSessions();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Debug Sessions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your saved regex debug sessions
            </p>
          </div>
          <Link href="/playground">
            <Button variant="gradient">New Session</Button>
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bug className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No saved sessions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Use the Share button in the playground to create a session
            </p>
            <Link href="/playground">
              <Button variant="gradient" className="mt-4">
                Go to Playground
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card gradient-border h-full transition-all hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base truncate">{session.name}</CardTitle>
                    {session.redosWarning ? (
                      <Badge variant="danger" className="shrink-0 ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {session.complexity}
                      </Badge>
                    ) : (
                      <Badge variant="success" className="shrink-0 ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {session.complexity}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Pattern:</span>
                      <code className="block mt-0.5 rounded border border-input bg-background/50 p-2 font-mono text-xs text-green-400 overflow-x-auto">
                        {truncate(session.pattern, 60)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/debug/${session.id}`}>
                        <Button variant="outline" size="sm">
                          Open <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
