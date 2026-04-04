import type { ReactNode } from "react";

export function FieldCard({
  label,
  hint,
  required,
  children,
  id,
}: {
  label: string;
  hint: string;
  required: boolean;
  children: ReactNode;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="mb-2">
        <span className="text-sm font-medium text-foreground">
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive/70">*</span>
          ) : null}
        </span>
      </div>

      <p className="mb-3 max-w-prose text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>

      {children}
    </div>
  );
}
