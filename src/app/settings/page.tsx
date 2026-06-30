"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes, perfect for late-night debugging" },
    { value: "light", label: "Light", icon: Sun, desc: "Bright and clear for daytime sessions" },
    { value: "system", label: "System", icon: Monitor, desc: "Follow your OS preference automatically" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize your RegexDebug experience
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all",
                    theme === t.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-input hover:border-purple-500/50 hover:bg-accent"
                  )}
                >
                  <t.icon
                    className={cn(
                      "h-8 w-8",
                      theme === t.value ? "text-purple-400" : "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium">{t.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{t.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>RegexDebug v1.0.0</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                RegexDebug is an open-source regex debugging toolkit built with Next.js,
                TypeScript, and Prisma. It provides step-by-step regex visualization,
                ReDoS detection, test case generation, and more.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">Next.js 14</span>
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">TypeScript</span>
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">Tailwind CSS</span>
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">Prisma</span>
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">Monaco Editor</span>
                <span className="rounded-md border border-input px-2 py-0.5 text-xs">Framer Motion</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
