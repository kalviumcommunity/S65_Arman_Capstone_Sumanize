import Summarizer from "@/components/summarizer";

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="w-full max-w-5xl px-6 py-8 mx-auto">
        <div className="w-full max-w-4xl mx-auto">
          <Summarizer />
        </div>
      </div>
    </main>
  );
}
