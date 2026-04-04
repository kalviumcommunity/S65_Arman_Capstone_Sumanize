"use client";

import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  APP_THEME_STORAGE_KEY,
  type AppTheme,
  DEFAULT_APP_THEME,
  getAppTheme,
  isAppTheme,
} from "@/lib/themes";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  setThemeWithShutter: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.appTheme = theme;
}

function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return DEFAULT_APP_THEME;

  const stored = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
  return stored && isAppTheme(stored) ? stored : DEFAULT_APP_THEME;
}

const SHUTTER_DURATION_MS = 820;
const THEME_SWAP_MS = 280;

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
    updateCallbackDone: Promise<void>;
  };
};

type TransitionMode = "view-transition" | "fallback";

function ThemeTransitionLayer({
  theme,
  mode,
}: {
  theme: AppTheme | null;
  mode: TransitionMode | null;
}) {
  if (!theme || !mode) return null;

  const nextTheme = getAppTheme(theme);

  return (
    <div
      aria-hidden
      className={
        mode === "view-transition"
          ? "theme-shutter theme-shutter-line-only"
          : "theme-shutter"
      }
      style={
        {
          "--theme-shutter-background": nextTheme.transition.background,
          "--theme-shutter-edge": nextTheme.transition.edge,
          "--theme-shutter-glow": nextTheme.transition.glow,
        } as CSSProperties
      }
    />
  );
}

function setTransitionThemeVars(theme: AppTheme | null) {
  if (!theme) {
    document.documentElement.style.removeProperty("--theme-shutter-background");
    document.documentElement.style.removeProperty("--theme-shutter-edge");
    document.documentElement.style.removeProperty("--theme-shutter-glow");
    return;
  }

  const nextTheme = getAppTheme(theme);
  document.documentElement.style.setProperty(
    "--theme-shutter-background",
    nextTheme.transition.background,
  );
  document.documentElement.style.setProperty(
    "--theme-shutter-edge",
    nextTheme.transition.edge,
  );
  document.documentElement.style.setProperty(
    "--theme-shutter-glow",
    nextTheme.transition.glow,
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_APP_THEME);
  const [transitionTheme, setTransitionTheme] = useState<AppTheme | null>(null);
  const [transitionMode, setTransitionMode] = useState<TransitionMode | null>(
    null,
  );
  const timeoutIdsRef = useRef<number[]>([]);
  const shouldUseFallbackTransition = pathname.startsWith("/chat/");

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutIdsRef.current) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setTransitionThemeVars(transitionTheme);
  }, [transitionTheme]);

  function clearTransitionTimers() {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }

  function queueTimeout(callback: () => void, delay: number) {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter(
        (activeId) => activeId !== timeoutId,
      );
      callback();
    }, delay);

    timeoutIdsRef.current.push(timeoutId);
  }

  function setThemeWithShutter(nextTheme: AppTheme) {
    if (nextTheme === theme && transitionTheme === null) {
      return;
    }

    const doc = document as DocumentWithViewTransition;

    if (doc.startViewTransition && !shouldUseFallbackTransition) {
      clearTransitionTimers();
      setTransitionTheme(nextTheme);
      setTransitionMode("view-transition");

      const transition = doc.startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.finished.finally(() => {
        setTransitionTheme(null);
        setTransitionMode(null);
      });

      return;
    }

    clearTransitionTimers();
    setTransitionTheme(nextTheme);
    setTransitionMode("fallback");

    queueTimeout(() => {
      setTheme(nextTheme);
    }, THEME_SWAP_MS);

    queueTimeout(() => {
      setTransitionTheme(null);
      setTransitionMode(null);
    }, SHUTTER_DURATION_MS);
  }

  const value = { theme, setTheme, setThemeWithShutter };

  return (
    <ThemeContext value={value}>
      {children}
      <ThemeTransitionLayer theme={transitionTheme} mode={transitionMode} />
    </ThemeContext>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
