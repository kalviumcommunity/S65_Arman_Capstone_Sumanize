"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarFour, ArrowRight, Check } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { GithubIcon, GoogleIcon } from "@/components/auth/icons";
import { motion, AnimatePresence } from "framer-motion";

export function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState(defaultTab);
  const [step, setStep] = useState("initial"); // initial, verification

  const { login, register, verifyEmail, pendingVerification, isVerifying } =
    useAuth();

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep("initial");
      setEmail("");
      setName("");
      setVerificationCode("");
    }
  }, [isOpen]);

  // Set email from pending verification if available
  useEffect(() => {
    if (pendingVerification && pendingVerification.email) {
      setEmail(pendingVerification.email);
      setStep("verification");
    }
  }, [pendingVerification]);

  const fadeIn = {
    hidden: {
      opacity: 0,
      filter: "blur(40px)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(40px)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const initiateGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/github`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const initiateGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const scope = "email profile";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = googleAuthUrl;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (step === "verification") {
      if (!verificationCode.trim()) {
        toast.error("Please enter the verification code");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await verifyEmail(email, verificationCode);
        if (result.success) {
          toast.success("Authentication successful");
          onClose();
        } else {
          toast.error(result.error || "Verification failed");
        }
      } catch (error) {
        toast.error("Verification error: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Initial step
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (authMode === "login") {
        result = await login(email);
      } else {
        result = await register(email, name);
      }

      if (result.success) {
        setStep("verification");
        toast.success("Verification code sent to your email");
      } else {
        toast.error(result.error || "Authentication failed");
      }
    } catch (error) {
      toast.error("Authentication error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login");
    setStep("initial");
  };

  const VisuallyHidden = ({ children }) => {
    return (
      <span
        style={{
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          width: "1px",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="backdrop-blur-md">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="auth-modal"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            <DialogContent className="max-w-xs p-6 border-none bg-neutral-900 rounded-md">
              <VisuallyHidden>
                <DialogTitle>Authentication Modal</DialogTitle>
              </VisuallyHidden>
              <div className="flex flex-col items-center justify-center px-4 py-8 space-y-6">
                <div className="flex items-center justify-center flex-col">
                  <h1 className="text-3xl font-serif text-neutral-300 text-center tracking-wide mb-2 flex items-center gap-1">
                    <StarFour size={28} className="text-neutral-300" />
                    Sumanize
                  </h1>
                  <p className="mt-1 text-sm text-neutral-400 text-center max-w-xs">
                    {step === "verification"
                      ? "Enter the verification code sent to your email."
                      : authMode === "login"
                        ? "Enter your email to sign in with a magic link, or continue with GitHub or Google."
                        : "Enter your email to create an account, or sign up by continuing with GitHub or Google."}
                  </p>
                </div>

                <form onSubmit={handleEmailAuth} className="w-full space-y-3">
                  {step === "initial" ? (
                    <>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-transparent border-neutral-800 text-neutral-300 h-10 rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Enter verification code"
                      className="w-full bg-neutral-800 border-neutral-700 text-white h-10 rounded-md"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-neutral-800 hover:bg-neutral-800/50 text-neutral-300 rounded-md h-10 flex items-center justify-center gap-2 cursor-pointer"
                    disabled={isSubmitting || isVerifying}
                  >
                    {isSubmitting || isVerifying ? (
                      "Processing..."
                    ) : step === "verification" ? (
                      <>
                        Verify
                        <Check size={20} weight="bold" />
                      </>
                    ) : (
                      <>
                        Continue with email
                        <ArrowRight size={20} weight="bold" />
                      </>
                    )}
                  </Button>
                </form>

                {step === "initial" && (
                  <>
                    <Separator className="w-full bg-neutral-600 rounded-md" />

                    <div className="w-full grid grid-cols-2 gap-4">
                      <Button
                        variant="icon"
                        className="flex items-center justify-center h-10 p-0 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base transition-colors duration-300 ease-in-out cursor-pointer"
                        onClick={initiateGithubLogin}
                        aria-label="Continue with Github"
                      >
                        <GithubIcon size={24} />
                      </Button>

                      <Button
                        variant="icon"
                        className="flex items-center justify-center h-10 p-0 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base transition-colors duration-300 ease-in-out cursor-pointer"
                        onClick={initiateGoogleLogin}
                        aria-label="Continue with Google"
                      >
                        <GoogleIcon size={24} />
                      </Button>
                    </div>
                  </>
                )}

                {step === "initial" && (
                  <div className="text-center text-sm text-neutral-400">
                    {authMode === "login" ? (
                      <>
                        Don't have an account?{" "}
                        <Button
                          onClick={toggleAuthMode}
                          variant="link"
                          className="px-0 text-neutral-300 cursor-pointer"
                        >
                          Create one
                        </Button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <Button
                          onClick={toggleAuthMode}
                          variant="link"
                          className="px-0 text-neutral-300 cursor-pointer"
                        >
                          Get inside
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {step === "verification" && (
                  <div className="text-center text-sm text-neutral-400">
                    Didn't receive the code?{" "}
                    <Button
                      onClick={() => setStep("initial")}
                      variant="link"
                      className="px-0 text-neutral-300 cursor-pointer"
                    >
                      Try again
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
