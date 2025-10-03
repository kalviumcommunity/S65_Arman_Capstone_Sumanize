"use client";

export default function Loading() {
  return (
    <main className="bg-[#191724] font-mono min-h-screen w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-[#c4a7e7] border-t-transparent" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#c4a7e7] mb-2">
          loading
        </h1>
        <p className="text-sm sm:text-base font-medium text-[#6e6a86]">
          Preparing your workspace…
        </p>
      </div>
    </main>
  );
}
