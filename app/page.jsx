import React from "react";
import Hero from "@/components/home/hero";
import Preview from "@/components/home/preview";
import Footer from "@/components/home/footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Preview />
      <Footer />
    </main>
  );
}
