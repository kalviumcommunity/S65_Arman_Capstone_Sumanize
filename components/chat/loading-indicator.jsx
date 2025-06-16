import { Spinner } from "@phosphor-icons/react";

export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-comet-900 text-comet-300 px-4 py-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Spinner size={18} className="animate-spin" />
          <span className="text-sm">Generating response...</span>
        </div>
      </div>
    </div>
  );
}
