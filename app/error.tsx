"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error;
  reset?: () => void;
}) {
  return (
    <main className="bg-background min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Error icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-base sm:text-lg text-foreground/60 mb-8">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (typeof reset === "function") {
                reset();
              } else {
                window.location.href = "/";
              }
            }}
            className="rounded-lg bg-primary hover:bg-primary/90 text-background px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-foreground/20 text-foreground px-5 py-2.5 text-sm font-semibold hover:bg-foreground/5 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}
