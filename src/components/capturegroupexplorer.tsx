"use client";

import { Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchResult } from "@/types";

interface CaptureGroupExplorerProps {
  matches: MatchResult[];
}

export default function CaptureGroupExplorer({ matches }: CaptureGroupExplorerProps) {
  const hasGroups = matches.some((m) => m.groups.length > 0);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Table className="h-4 w-4 text-blue-400" />
          Capture Group Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasGroups ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No capture groups found. Add parentheses to your pattern to capture groups.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-semibold">Match #</th>
                  <th className="pb-2 pr-4 font-semibold">Group</th>
                  <th className="pb-2 pr-4 font-semibold">Name</th>
                  <th className="pb-2 pr-4 font-semibold">Value</th>
                  <th className="pb-2 pr-4 font-semibold">Position</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, matchIdx) =>
                  match.groups.map((group, groupIdx) => (
                    <tr
                      key={`${matchIdx}-${groupIdx}`}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="font-mono">#{matchIdx + 1}</Badge>
                      </td>
                      <td className="py-2 pr-4 font-mono">
                        {group.name ? (
                          <Badge variant="default">{group.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">${group.index}</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {group.name ? (
                          <Badge variant="success" className="font-mono">{group.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 font-mono text-green-400">
                        "{group.value}"
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                        {group.start}–{group.end}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
