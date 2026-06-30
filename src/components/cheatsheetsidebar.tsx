"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CheatsheetPattern } from "@/types";

const CHEATSHEET: CheatsheetPattern[] = [
  {
    name: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Matches standard email addresses",
    example: "user@example.com",
  },
  {
    name: "URL",
    pattern: "https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w.,@?^=%&:/~+#-]*",
    description: "Matches HTTP/HTTPS URLs",
    example: "https://www.example.com/path?q=1",
  },
  {
    name: "Phone (US)",
    pattern: "\\+?1?\\s?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}",
    description: "Matches US phone number formats",
    example: "+1 (555) 123-4567",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b",
    description: "Matches valid IPv4 addresses",
    example: "192.168.1.1",
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])",
    description: "Matches dates in ISO 8601 format",
    example: "2024-03-15",
  },
  {
    name: "Hex Color",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}",
    description: "Matches hex color codes",
    example: "#FF5733",
  },
  {
    name: "UUID",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
    description: "Matches UUID v4 format",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    name: "Password Strength",
    pattern: "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}",
    description: "Minimum 8 chars, upper, lower, digit, special",
    example: "Str0ng!Pass",
  },
  {
    name: "Postal Code (US)",
    pattern: "\\d{5}(?:-\\d{4})?",
    description: "Matches US ZIP codes",
    example: "12345-6789",
  },
  {
    name: "Credit Card",
    pattern: "(?:\\d{4}[\\s-]?){3}\\d{4}",
    description: "Matches 16-digit credit card numbers",
    example: "4111 1111 1111 1111",
  },
  {
    name: "Time (24h)",
    pattern: "([01]?\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?",
    description: "Matches 24-hour time format",
    example: "14:30:00",
  },
  {
    name: "Slug",
    pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
    description: "Matches URL-friendly slugs",
    example: "my-blog-post-title",
  },
];

interface CheatsheetSidebarProps {
  onSelect?: (pattern: string) => void;
}

export default function CheatsheetSidebar({ onSelect }: CheatsheetSidebarProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-yellow-400" />
          Cheatsheet
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto">
        <div className="space-y-1">
          {CHEATSHEET.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => setExpanded(expanded === item.name ? null : item.name)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span className="font-medium">{item.name}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expanded === item.name && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {expanded === item.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-1 space-y-2">
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <div className="rounded-md border border-input bg-background/50 p-2">
                        <code className="text-xs text-green-400 font-mono break-all">{item.pattern}</code>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Example: </span>
                        <Badge variant="outline" className="font-mono">{item.example}</Badge>
                      </div>
                      {onSelect && (
                        <button
                          onClick={() => onSelect(item.pattern)}
                          className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                        >
                          Use this pattern →
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Quick reference */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Reference
          </h4>
          <div className="space-y-1 text-xs">
            {[
              { token: ".", desc: "Any char" },
              { token: "\\d", desc: "Digit" },
              { token: "\\w", desc: "Word char" },
              { token: "\\s", desc: "Whitespace" },
              { token: "\\b", desc: "Word boundary" },
              { token: "^", desc: "Start" },
              { token: "$", desc: "End" },
              { token: "*", desc: "0 or more" },
              { token: "+", desc: "1 or more" },
              { token: "?", desc: "Optional" },
              { token: "{n}", desc: "Exactly n" },
              { token: "{n,m}", desc: "n to m" },
              { token: "[abc]", desc: "Char class" },
              { token: "(...)", desc: "Group" },
              { token: "(?:...)", desc: "Non-capture" },
              { token: "(?=...)", desc: "Lookahead" },
              { token: "(?<=...)", desc: "Lookbehind" },
            ].map((ref) => (
              <div key={ref.token} className="flex items-center gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-purple-300">{ref.token}</code>
                <span className="text-muted-foreground">{ref.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
