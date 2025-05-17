"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Hero from "@/components/home/hero";
import Preview from "@/components/home/preview";
import Footer from "@/components/home/footer";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to /summarize when user is authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/summarize");
    }
  }, [user, isLoading, router]);

  const openLoginModal = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          className="text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
          onClick={openLoginModal}
        >
          Login
        </Button>
        <Button
          className="bg-neutral-300 hover:bg-neutral-200 text-neutral-900"
          onClick={openRegisterModal}
        >
          Sign Up
        </Button>
      </div>

      <Hero />
      <Preview />
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </main>
  );
}
