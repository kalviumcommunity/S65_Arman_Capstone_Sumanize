"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-2 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-300 text-center">
            {activeTab === "login" ? "Login" : "Create an Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant="ghost"
            className={`flex-1 ${
              activeTab === "login"
                ? "bg-neutral-800 text-neutral-200"
                : "bg-transparent text-neutral-400"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 ${
              activeTab === "register"
                ? "bg-neutral-800 text-neutral-200"
                : "bg-transparent text-neutral-400"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-300">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-neutral-200"
              placeholder="your@email.com"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-300">
              Password
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-neutral-200"
              type="password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-neutral-300 hover:bg-neutral-200 text-neutral-900 font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : activeTab === "login"
                ? "Login"
                : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
