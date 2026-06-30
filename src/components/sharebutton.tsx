"use client";

import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ShareButtonProps {
  pattern: string;
  testString: string;
  steps?: string;
  captures?: string;
  redosWarning?: boolean;
  complexity?: string;
}

export default function ShareButton({
  pattern,
  testString,
  steps = "[]",
  captures = "[]",
  redosWarning = false,
  complexity = "O(n)",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setCopied(false);
    try {
      // Create session
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Session ${new Date().toLocaleString()}`,
          pattern,
          testString,
          steps,
          captures,
          redosWarning,
          complexity,
        }),
      });
      const sessionData = await sessionRes.json();
      const sessionId = sessionData.session.id;

      // Get shareable link
      const shareRes = await fetch(`/api/sessions/${sessionId}/share`);
      const shareData = await shareRes.json();

      const url = `${window.location.origin}/debug/${sessionId}?token=${shareData.token}`;
      setShareUrl(url);
    } catch (e) {
      console.error("Failed to create shareable link:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Debug Session</DialogTitle>
          <DialogDescription>
            Create a shareable link for this regex debug session. The link will be valid for 30 days.
          </DialogDescription>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button onClick={handleCopy} variant="gradient" size="icon">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="success">Link created</Badge>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  Open <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="py-4 text-sm text-muted-foreground">
            Click the button below to create a shareable link for your current debug session.
          </div>
        )}

        <DialogFooter>
          {!shareUrl && (
            <Button onClick={handleShare} disabled={loading || !pattern} variant="gradient">
              {loading ? "Creating..." : "Create Shareable Link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
