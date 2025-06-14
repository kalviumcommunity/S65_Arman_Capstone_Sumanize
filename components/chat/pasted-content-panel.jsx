import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const MarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="mb-4 text-2xl font-bold" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mb-3 text-xl font-semibold" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mb-3 text-lg font-semibold" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-4 list-disc space-y-2 pl-5" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-5" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-blue-400 hover:underline" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-white"
      {...props}
    />
  ),
  code: ({ node, ...props }) => (
    <code className="rounded bg-neutral-800 px-1.5 py-1" {...props} />
  ),
  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
};

export function PastedContentPanel({ content, onClose }) {
  if (!content) return null;

  return (
    <div className="flex-shrink-0 w-1/2 bg-comet-850 border-l border-comet-750 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-comet-750">
        <h3 className="text-lg font-semibold text-comet-200">Pasted Content</h3>
        <Button
          onClick={onClose}
          size="sm"
          className="h-8 w-8 p-0 bg-comet-700 hover:bg-comet-600 rounded-full"
        >
          <X size={16} className="text-comet-200" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-comet-900 text-comet-300 rounded-xl p-4">
          <ReactMarkdown components={MarkdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
