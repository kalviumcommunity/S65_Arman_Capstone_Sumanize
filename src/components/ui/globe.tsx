"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.22,
  dark: 1,
  diffuse: 1.05,
  mapSamples: 16000,
  mapBrightness: 1.8,
  mapBaseBrightness: 0.15,
  baseColor: [0.12, 0.12, 0.12],
  markerColor: [0.12, 0.12, 0.12],
  glowColor: [0.82, 0.84, 0.9],
  markers: [],
  opacity: 0.92,
};

function parseColorValue(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : hex;

    const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
    const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;

    return [red, green, blue] as [number, number, number];
  }

  const rgbMatch = trimmed.match(/\d+(?:\.\d+)?/g);
  if (!rgbMatch || rgbMatch.length < 3) {
    return null;
  }

  return [
    Number(rgbMatch[0]) / 255,
    Number(rgbMatch[1]) / 255,
    Number(rgbMatch[2]) / 255,
  ] as [number, number, number];
}

function readThemeGlobeColors() {
  if (typeof window === "undefined") {
    return null;
  }

  const styles = window.getComputedStyle(document.documentElement);
  const primary = parseColorValue(styles.getPropertyValue("--primary"));
  const accent = parseColorValue(styles.getPropertyValue("--accent"));
  const background = parseColorValue(styles.getPropertyValue("--background"));
  const muted = parseColorValue(styles.getPropertyValue("--muted"));

  if (!primary || !accent || !background || !muted) {
    return null;
  }

  return {
    baseColor: [
      primary[0] * 0.12 +
        accent[0] * 0.16 +
        muted[0] * 0.4 +
        background[0] * 0.32,
      primary[1] * 0.12 +
        accent[1] * 0.16 +
        muted[1] * 0.4 +
        background[1] * 0.32,
      primary[2] * 0.12 +
        accent[2] * 0.16 +
        muted[2] * 0.4 +
        background[2] * 0.32,
    ],
    glowColor: [
      primary[0] * 0.22 + accent[0] * 0.18 + background[0] * 0.6,
      primary[1] * 0.22 + accent[1] * 0.18 + background[1] * 0.6,
      primary[2] * 0.22 + accent[2] * 0.18 + background[2] * 0.6,
    ],
    markerColor: [
      primary[0] * 0.62 + accent[0] * 0.38,
      primary[1] * 0.62 + accent[1] * 0.38,
      primary[2] * 0.62 + accent[2] * 0.38,
    ],
    dark: 0,
  } satisfies Pick<
    COBEOptions,
    "baseColor" | "glowColor" | "markerColor" | "dark"
  >;
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const [themeConfig, setThemeConfig] = useState<Partial<COBEOptions>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);

  const rotation = useMotionValue(0);
  const rotationSpring = useSpring(rotation, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value === null ? "grab" : "grabbing";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current === null) {
      return;
    }

    const delta = clientX - pointerInteracting.current;
    pointerInteracting.current = clientX;
    rotation.set(rotation.get() + delta / MOVEMENT_DAMPING);
  };

  useEffect(() => {
    const syncTheme = () => {
      const nextThemeConfig = readThemeGlobeColors();
      if (nextThemeConfig) {
        setThemeConfig(nextThemeConfig);
      }
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-app-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current || widthRef.current === 0) {
      return () => window.removeEventListener("resize", onResize);
    }

    const globe = createGlobe(canvasRef.current, {
      ...config,
      ...themeConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
    });

    const render = () => {
      const state: Partial<COBEOptions> = {
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      };

      if (pointerInteracting.current === null) {
        phiRef.current += 0.004;
      }

      state.phi = phiRef.current + rotationSpring.get();
      globe.update(state);
      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    requestAnimationFrame(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config, rotationSpring, themeConfig]);

  return (
    <div
      className={cn(
        "absolute inset-x-0 mx-auto aspect-square w-full max-w-[430px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_100%)]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        onPointerDown={(event) => updatePointerInteraction(event.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(event) => updateMovement(event.clientX)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) {
            updateMovement(touch.clientX);
          }
        }}
      />
    </div>
  );
}
