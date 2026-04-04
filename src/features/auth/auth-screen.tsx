"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/get-error-message";
import { pageReveal, riseInItem, staggerContainer } from "@/lib/motion";

export function AuthScreen() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = shouldReduceMotion ?? false;
  const [mode, setMode] = useState<"signIn" | "signUp">("signUp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimeoutRef = useRef<number | null>(null);
  const reveal = pageReveal(reduceMotion);

  const navigateToStartup = useCallback(() => {
    if (isExiting) {
      return;
    }

    if (reduceMotion) {
      router.replace("/startup");
      return;
    }

    setIsExiting(true);
    exitTimeoutRef.current = window.setTimeout(() => {
      router.replace("/startup");
    }, 220);
  }, [isExiting, reduceMotion, router]);

  useEffect(() => {
    if (isAuthenticated) {
      navigateToStartup();
    }
  }, [isAuthenticated, navigateToStartup]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.set("flow", mode);
      const result = await signIn("password", formData);

      if (result.signingIn) {
        navigateToStartup();
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Unable to authenticate. Check your details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "h-10 rounded-md border-border/80 bg-card/70 text-[15px] placeholder:text-muted-foreground/70";

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground"
      initial={reveal.initial}
      animate={
        isExiting
          ? { opacity: 0, y: -8 }
          : (reveal.animate ?? { opacity: 1, y: 0 })
      }
      transition={{
        duration: reduceMotion ? 0 : isExiting ? 0.22 : 0.54,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <motion.div
          className="relative min-h-[340px] overflow-hidden border-b border-border/70 lg:min-h-screen lg:w-[40%] lg:border-r lg:border-b-0"
          variants={staggerContainer(reduceMotion, 0.05)}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/francesco-sMvBhXI9HEM-unsplash.jpg"
            alt="Architectural curves in evening light"
            fill
            priority
            quality={100}
            unoptimized
            className="object-cover object-center"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <motion.div
            className="absolute bottom-0 left-0 z-10 w-full p-5 text-white sm:p-7 lg:p-10"
            variants={riseInItem(reduceMotion, 10)}
          >
            <div className="flex items-center gap-2.5 text-base font-semibold text-white sm:text-lg [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
              <Image
                src="/favicon.svg"
                alt="Research Agent logo"
                width={22}
                height={22}
                className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px]"
              />
              <p>Research Agent</p>
            </div>
            <p className="mt-3 max-w-xl text-balance text-sm leading-relaxed text-white/80 sm:text-base [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
              Turn raw signals into launch-ready intelligence.
            </p>
          </motion.div>
        </motion.div>

        <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <motion.form
            className="w-full max-w-[400px] space-y-5"
            onSubmit={handleSubmit}
          >
            <motion.div
              className="space-y-2 text-left"
              variants={riseInItem(reduceMotion, 10)}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[30px]">
                {mode === "signIn"
                  ? "Welcome to Research Agent"
                  : "Create your account"}
              </h1>
              <p className="text-[15px] text-muted-foreground">
                {mode === "signIn"
                  ? "Structured brand research for founders."
                  : "Create your workspace."}
              </p>
            </motion.div>

            <motion.div
              className="space-y-5"
              variants={riseInItem(reduceMotion, 18)}
              initial="hidden"
              animate="visible"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[13px] font-normal text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  required
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[13px] font-normal text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "signIn" ? "current-password" : "new-password"
                  }
                  placeholder="At least 8 characters"
                  required
                  className={fieldClass}
                />
              </div>
              <Button
                size="lg"
                className="h-10 w-full text-[15px] font-medium"
                type="submit"
                disabled={isSubmitting || isLoading || isExiting}
              >
                {isSubmitting
                  ? mode === "signIn"
                    ? "Signing in…"
                    : "Creating account…"
                  : "Continue"}
              </Button>
              <p className="text-left text-[13px] text-muted-foreground">
                {mode === "signIn" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      onClick={() => setMode("signUp")}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      onClick={() => setMode("signIn")}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </motion.form>
        </section>
      </div>
    </motion.div>
  );
}
