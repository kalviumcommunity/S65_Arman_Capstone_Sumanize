import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

export function SearchInput({ searchQuery, onSearchChange }) {
  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 border-none focus:ring-0 text-neutral-500 placeholder:text-neutral-500 focus:o"
        />
      </div>
    </div>
  );
}
