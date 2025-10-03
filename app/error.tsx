"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error;
  reset?: () => void;
}) {
  return (
    <main className="bg-[#191724] font-mono min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#c4a7e7] mb-3">
          something went wrong
        </h1>
        <p className="text-base sm:text-lg font-medium text-[#6e6a86] mb-8">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() =>
              typeof reset === "function"
                ? reset()
                : (window.location.href = "/")
            }
            className="rounded-md bg-[#c4a7e7] text-[#191724] px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            try again
          </button>
          <a
            href="/"
            className="rounded-md border border-[#6e6a86]/40 text-[#e0def4] px-4 py-2 text-sm font-semibold hover:bg-[#1f1b2a] transition"
          >
            go home
          </a>
        </div>
      </div>
    </main>
  );
}
