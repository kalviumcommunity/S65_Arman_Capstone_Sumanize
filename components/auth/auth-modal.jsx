"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarFour, ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { GithubIcon, GoogleIcon, TwitterIcon } from "@/components/auth/icons";
import { motion, AnimatePresence } from "framer-motion";

export function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState(defaultTab);
  const { login, register } = useAuth();

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

  const handleGoogleAuth = async () => {
    toast.info("Google authentication coming soon");
  };

  const handleGithubAuth = async () => {
    toast.info("Github authentication coming soon");
  };

  const handleTwitterAuth = async () => {
    toast.info("Twitter authentication coming soon");
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (authMode === "login") {
        result = await login(email, password);
      } else {
        result = await register(email, password);
      }

      if (result.success) {
        toast.success(
          authMode === "login"
            ? "Logged in successfully"
            : "Email verification coming soon",
        );
        onClose();
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
    setShowPassword(false);
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
                    {authMode === "login"
                      ? "Enter your email and password to sign in, or continue with Github, Google, or Twitter."
                      : "Enter your email and create a password, or sign up by continuing with Github, Google, or Twitter."}
                  </p>
                </div>

                <form onSubmit={handleEmailAuth} className="w-full">
                  {!showPassword ? (
                    <Input
                      type="email"
                      placeholder="Enter a valid email"
                      className="w-full bg-transparent border-neutral-800 text-neutral-300 h-10 rounded-md mb-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  ) : (
                    <Input
                      type="password"
                      placeholder="Enter a strong password"
                      className="w-full bg-neutral-800 border-neutral-700 text-white h-10 rounded-md mb-3"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-neutral-800 hover:bg-neutral-800/50 text-neutral-300 rounded-md h-10 flex items-center justify-center gap-2 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {showPassword
                      ? authMode === "login"
                        ? "Get Started"
                        : "Get Started"
                      : "Continue with email"}
                    <ArrowRight size={24} weight="bold" />
                  </Button>
                </form>

                <Separator className="w-full bg-neutral-600 rounded-md" />

                <div className="w-full grid grid-cols-3 gap-4">
                  <Button
                    variant="icon"
                    className="flex items-center justify-center h-10 p-0 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleGithubAuth}
                    aria-label="Continue with Github"
                  >
                    <GithubIcon size={24} />
                  </Button>

                  <Button
                    variant="icon"
                    className="flex items-center justify-center h-10 p-0 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleGoogleAuth}
                    aria-label="Continue with Google"
                  >
                    <GoogleIcon size={24} />
                  </Button>

                  <Button
                    variant="icon"
                    className="flex items-center justify-center h-10 p-0 bg-neutral-300 hover:bg-neutral-400 text-neutral-950 rounded-md text-base transition-colors duration-300 ease-in-out cursor-pointer"
                    onClick={handleTwitterAuth}
                    aria-label="Continue with Twitter"
                  >
                    <TwitterIcon size={24} />
                  </Button>
                </div>

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
              </div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
