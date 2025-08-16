import Header from "@/components/layout/header";
import Summarizer from "@/components/summarizer/summarizer";
import CommandPalette from "@/components/layout/command";

export default function Page() {
  return (
    <>
      {/* <Header /> */}
      <CommandPalette />
      <main>
        <Summarizer />
      </main>
    </>
  );
}
