"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleLogo, GithubLogo, TwitterLogo } from "@phosphor-icons/react";
import Image from "next/image";

// VisuallyHidden component for accessibility
function VisuallyHidden({ children }) {
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
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "login") {
        const result = await login(email, password);
        if (result.success) {
          toast.success("Logged in successfully");
          onClose();
        } else {
          toast.error(result.error || "Login failed");
        }
      } else {
        const result = await register(email, password);
        if (result.success) {
          toast.success("Account created and logged in successfully");
          onClose();
        } else {
          toast.error(result.error || "Registration failed");
        }
      }
    } catch (error) {
      toast.error("Authentication error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] p-0 border-neutral-800 bg-neutral-800/80 backdrop-blur-sm">
        <VisuallyHidden>
          <DialogTitle>Authentication Modal</DialogTitle>
        </VisuallyHidden>
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px]">
            <form
              onSubmit={handleSubmit}
              className="p-6 flex flex-col justify-center"
            >
              <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-neutral-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-neutral-200"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-neutral-300">
                      Password
                    </Label>
                    {activeTab === "login" && (
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline text-neutral-300"
                      >
                        Forgot?
                      </a>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-neutral-700 border-neutral-600 text-neutral-200"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-neutral-200 text-neutral-900 hover:bg-neutral-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Please wait..."
                    : activeTab === "login"
                      ? "Login"
                      : "Create Account"}
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-700">
                  <span className="relative z-10 bg-neutral-800 px-2 text-neutral-400">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="w-full bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                  >
                    <GithubLogo size={20} />
                    <span className="sr-only">Login with Github</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                  >
                    <GoogleLogo size={20} />
                    <span className="sr-only">Login with Google</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600"
                  >
                    <TwitterLogo size={20} />
                    <span className="sr-only">Login with Twitter</span>
                  </Button>
                </div>
                <div className="text-center text-sm text-neutral-400">
                  {activeTab === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <a
                        href="#"
                        className="underline underline-offset-4 text-neutral-300"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("register");
                        }}
                      >
                        Sign up
                      </a>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <a
                        href="#"
                        className="underline underline-offset-4 text-neutral-300"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("login");
                        }}
                      >
                        Login
                      </a>
                    </>
                  )}
                </div>
              </div>
            </form>
            <div className="relative hidden md:block min-h-[500px]">
              <Image
                src="/images/upgrade-plan.jpg"
                alt="Login"
                fill
                className=""
                objectFit="cover"
              />
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
