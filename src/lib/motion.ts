import type { Transition, Variants } from "motion/react";

export const MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MOTION_SPRING = {
  damping: 26,
  mass: 0.72,
  stiffness: 210,
  type: "spring" as const,
};

export const pageReveal = (
  shouldReduceMotion: boolean,
): {
  initial: false | Record<string, number | string>;
  animate: undefined | Record<string, number | string>;
  transition: Transition;
} => ({
  initial: shouldReduceMotion
    ? false
    : { filter: "blur(8px)", opacity: 0, scale: 0.992, y: 14 },
  animate: shouldReduceMotion
    ? undefined
    : { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 },
  transition: {
    duration: shouldReduceMotion ? 0 : 0.56,
    ease: MOTION_EASE,
  },
});

export const staggerContainer = (
  shouldReduceMotion: boolean,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren: shouldReduceMotion ? 0 : delayChildren,
      staggerChildren: shouldReduceMotion ? 0 : 0.075,
    },
  },
});

export const riseInItem = (
  shouldReduceMotion: boolean,
  offsetY = 14,
): Variants => ({
  hidden: shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : { filter: "blur(5px)", opacity: 0, y: offsetY },
  visible: shouldReduceMotion
    ? { opacity: 1, y: 0 }
    : {
        filter: "blur(0px)",
        opacity: 1,
        transition: {
          duration: 0.44,
          ease: MOTION_EASE,
        },
        y: 0,
      },
});
