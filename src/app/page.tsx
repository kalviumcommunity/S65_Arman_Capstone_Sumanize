import Summarizer from "@/components/summarizer/summarizer";
import CommandPalette from "@/components/layout/command";

export default function Page() {
  return (
    <>
      <CommandPalette />
      <main>
        <Summarizer />
      </main>
    </>
  );
}
