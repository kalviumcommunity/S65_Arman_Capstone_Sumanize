"use client";

import { Button } from "@/components/ui/button";
import {
  GithubLogo,
  Sparkle,
  Command,
  BookOpen,
  Question,
} from "@phosphor-icons/react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="fill" className="text-yellow-500" />
              <span className="font-semibold text-lg">Sumanize</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Contribute
              </Button>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <BookOpen size={16} className="mr-1" />
                Docs
              </Button>
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                <Question size={16} className="mr-1" />
                Help
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-sm"
            >
              <Command size={16} />
              <span className="hidden sm:inline">Ctrl + K</span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>

            {/* GitHub Icon */}
            <Button variant="ghost" size="icon">
              <GithubLogo size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
