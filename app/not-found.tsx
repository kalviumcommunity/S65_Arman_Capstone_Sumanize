"use client";

export default function NotFound() {
  return (
    <main className="bg-[#191724] font-mono min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#c4a7e7] mb-3">
          page not found
        </h1>
        <p className="text-base sm:text-lg font-medium text-[#6e6a86] mb-8">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-[#c4a7e7] text-[#191724] px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
        >
          go home
        </a>
      </div>
    </main>
  );
}
