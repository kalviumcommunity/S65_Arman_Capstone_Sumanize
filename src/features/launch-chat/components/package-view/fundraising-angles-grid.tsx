"use client";

function inferTitle(text: string): [string | null, string] {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 60) {
    return [text.slice(0, colonIdx).trim(), text.slice(colonIdx + 1).trim()];
  }
  return [null, text];
}

export function FundraisingAnglesGrid({ angles }: { angles: string[] }) {
  if (angles.length === 0) return null;

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both px-6 py-6"
      style={{ animationDelay: "300ms", animationDuration: "500ms" }}
    >
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        Fundraising angles
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {angles.map((angle) => {
          const [title, body] = inferTitle(angle);
          return (
            <div
              key={angle}
              className="rounded-lg border border-border/30 bg-muted/[0.04] px-4 py-4 transition-colors hover:bg-muted/[0.08]"
            >
              {title ? (
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  {title}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-foreground/85">
                {body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
