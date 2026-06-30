import Link from "next/link";
import { Bug, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-muted-foreground">
              RegexDebug — Built with ❤️ for developers
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://twitter.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <span className="text-xs text-muted-foreground">
              MIT License
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
