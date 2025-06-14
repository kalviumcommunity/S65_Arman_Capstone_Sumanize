import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export function SearchInput({ searchQuery, onSearchChange }) {
  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <MagnifyingGlass
          weight="bold"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-comet-400 w-4 h-4"
        />
        <Input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 border-none focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-comet-400 placeholder:text-comet-400 cursor-p"
        />
      </div>
    </div>
  );
}
