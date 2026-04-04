"use client";

export function PackageHero({ angle }: { angle: string }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both px-6 py-6"
      style={{ animationDelay: "0ms", animationDuration: "500ms" }}
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Strategic angle
      </p>
      <div className="border-l-2 border-foreground/20 pl-5">
        <p className="text-lg leading-[1.75] text-foreground/90 sm:text-xl sm:leading-[1.75]">
          {angle}
        </p>
      </div>
    </div>
  );
}
