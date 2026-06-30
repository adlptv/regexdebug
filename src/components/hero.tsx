"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bug, ShieldAlert, FlaskConical, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Hero() {
  const features = [
    {
      icon: Bug,
      title: "Step Debugging",
      description: "Watch your regex execute step-by-step. See every position, match, and backtracking decision in real-time.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: ShieldAlert,
      title: "ReDoS Detection",
      description: "Automatically detect catastrophic backtracking patterns and estimate worst-case complexity before they hit production.",
      color: "from-red-500 to-orange-500",
    },
    {
      icon: FlaskConical,
      title: "Test Generator",
      description: "Auto-generate valid and invalid test cases from your regex pattern. Verify edge cases with a single click.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Share2,
      title: "Share Sessions",
      description: "Save your debug sessions and share them with teammates. Collaborate on regex patterns with shareable links.",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Floating regex patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { text: "/^https?://", top: "10%", left: "5%", delay: 0 },
          { text: "/\\d{3}-\\d{4}/", top: "20%", right: "8%", delay: 1 },
          { text: "/[A-Z][a-z]+/", top: "60%", left: "3%", delay: 2 },
          { text: "/\\b\\w+@\\w+\\.com\\b/", top: "75%", right: "5%", delay: 0.5 },
          { text: "/(a|b)*\\1/", top: "40%", left: "50%", delay: 1.5 },
          { text: "/^[a-f0-9]{32}$/", top: "15%", left: "60%", delay: 2.5 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 1, delay: item.delay }}
            className="absolute font-mono text-lg text-purple-300"
            style={{ top: item.top, left: item.left, right: item.right }}
          >
            <motion.span
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: item.delay }}
            >
              {item.text}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            Open Source Regex Toolkit
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text">Debug Regex</span>
            <br />
            <span className="text-foreground">Like a Pro</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Step-by-step regex debugger with ReDoS detection, test case generation,
            and shareable sessions. Understand every character of your pattern.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/playground">
              <Button variant="gradient" size="lg" className="group">
                Start Debugging
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/sessions">
              <Button variant="outline" size="lg">
                View Sessions
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Card className="glass-card gradient-border h-full transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardHeader>
                  <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          {[
            { label: "Step Tracking", value: "Real-time" },
            { label: "ReDoS Patterns", value: "6+ Detected" },
            { label: "Complexity", value: "O(n) → O(2ⁿ)" },
            { label: "Test Cases", value: "Auto-generated" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
