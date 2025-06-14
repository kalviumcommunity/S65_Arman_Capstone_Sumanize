"use client";

export function SectionHeader({ title, count }) {
  return (
    <div className="px-2 py-1 mb-2">
      <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
        {title} {count > 0 && `(${count})`}
      </h3>
    </div>
  );
}
