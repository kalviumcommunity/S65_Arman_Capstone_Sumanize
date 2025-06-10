"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProvider, setLoadingProvider] = useState("");

  const handleOAuthSignIn = async (provider) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setError("");

    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(`Failed to sign in with ${provider}. Please try again.`);
        setIsLoading(false);
        setLoadingProvider("");
      } else if (result?.ok) {
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("OAuth sign in error:", error);
      setError(
        `An error occurred while signing in with ${provider}. Please try again.`,
      );
      setIsLoading(false);
      setLoadingProvider("");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4 border border-neutral-700">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLoading ? "Signing you in..." : "Welcome to Sumanize"}
          </h2>
          <p className="text-neutral-400">
            {isLoading
              ? "Please wait while we authenticate you"
              : "Sign in to save your chats and get more messages"}
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 disabled:opacity-50"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading && loadingProvider === "google" ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Continue with Google"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 disabled:opacity-50"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {isLoading && loadingProvider === "github" ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Continue with GitHub"
            )}
          </Button>
        </div>

        {/* Benefits */}
        {!isLoading && (
          <div className="mt-6 bg-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">
              Why sign in?
            </h3>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>• Save your chats across devices</li>
              <li>• Get 50 messages instead of 4</li>
              <li>• Access chat history anytime</li>
              <li>• Upgrade to Premium for unlimited usage</li>
            </ul>
          </div>
        )}

        {/* Terms */}
        {!isLoading && (
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
