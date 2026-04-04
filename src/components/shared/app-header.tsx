"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  ArrowRight,
  Check,
  GearSix,
  GlobeSimple,
  Palette,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { appThemes } from "@/lib/themes";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  actions?: ReactNode;
  showThemeSelector?: boolean;
  showPrimaryNav?: boolean;
  showSignOut?: boolean;
  showSignIn?: boolean;
  className?: string;
};

export function AppHeader({
  actions,
  showThemeSelector = false,
  showPrimaryNav = true,
  showSignOut = true,
  showSignIn = false,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { theme, setThemeWithShutter } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/auth");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  const brandLink = (
    <Link
      href={showPrimaryNav ? "/startup" : "/auth"}
      className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
    >
      <GlobeSimple size={18} weight="fill" className="shrink-0 text-primary" />
      Research Agent
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {brandLink}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {showSignIn ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="gap-1.5"
            render={<Link href="/auth" />}
          >
            <ArrowRight size={14} weight="bold" aria-hidden />
            Sign in
          </Button>
        ) : null}
        {showSignOut ? (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Open settings"
                />
              }
            >
              <GearSix size={18} weight="fill" />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1">
              {showThemeSelector ? (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Theme
                  </div>
                  <div className="space-y-1">
                    {appThemes.map((option) => {
                      const isActive = option.value === theme;

                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-between",
                            isActive && "bg-muted text-foreground",
                          )}
                          onClick={() => setThemeWithShutter(option.value)}
                        >
                          <span className="flex items-center gap-1.5">
                            <Palette
                              size={14}
                              weight={isActive ? "fill" : "regular"}
                            />
                            {option.label}
                          </span>
                          <span className="text-primary">
                            {isActive ? (
                              <Check size={14} weight="bold" />
                            ) : null}
                          </span>
                        </Button>
                      );
                    })}
                  </div>

                  <Separator className="my-1 bg-border/70" />
                </>
              ) : null}

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-1.5"
                disabled={isSigningOut}
                onClick={handleSignOut}
                aria-label={isSigningOut ? "Signing out" : "Sign out"}
              >
                <SignOut size={14} />
                {isSigningOut ? "Signing out" : "Sign out"}
              </Button>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </header>
  );
}
