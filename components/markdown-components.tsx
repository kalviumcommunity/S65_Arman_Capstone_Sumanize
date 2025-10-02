import type React from "react";
import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold mb-2" {...props}>
      {children}
    </h3>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed mb-2" {...props}>
      {children}
    </li>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-relaxed mb-2" {...props}>
      {children}
    </p>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto border border-stone-500 ">
      <table className="w-full text-sm text-left text-stone-950" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-stone-400 border-b border-stone-500" {...props}>
      {children}
    </thead>
  ),
  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="bg-stone-200 border-b border-stone-500 last:border-b-0 hover:bg-stone-100 transition-colors duration-200"
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      scope="col"
      className="px-4 py-3 font-semibold text-stone-950"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLTableDataCellElement>) => (
    <td className="px-4 py-3 align-top text-stone-950" {...props}>
      {children}
    </td>
  ),
  code: ({
    inline,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (inline) {
      return (
        <code
          className="px-1.5 py-1 bg-[#FFF1F1] text-black text-sm font-mono inline-block"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <div className="relative group my-2">
        <pre className="bg-[#FFF1F1] overflow-x-auto whitespace-pre-wrap break-words">
          <code
            className="text-[#fff1f1] text-xs font-mono leading-relaxed"
            {...props}
          >
            {children}
          </code>
        </pre>
      </div>
    );
  },
};
