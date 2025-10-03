// SSR Concept 4: Server Component Page
// This page.tsx demonstrates Next.js App Router server component behavior

import Summarizer from "@/components/summarizer";

// SSR Concept 5: Server-Side Page Rendering
// This is a Server Component that:
// - Runs on the server during each request (SSR)
// - Pre-renders HTML on the server before sending to client
// - Improves SEO by providing fully rendered HTML to crawlers
// - Enables faster initial page loads (First Contentful Paint)
// - Reduces client-side JavaScript execution time
// - Provides better performance on slow devices/networks
export default function Page() {
  return (
    <main className="bg-[#191724] font-mono">
      <Summarizer />
    </main>
  );
}
