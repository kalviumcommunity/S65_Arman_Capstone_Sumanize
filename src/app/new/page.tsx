import { StartupBriefScreen } from "@/features/startup-brief/startup-brief-screen";
import { requireAuthenticatedPage } from "@/lib/require-authenticated-page";

export default async function NewStartupPage() {
  await requireAuthenticatedPage();

  return <StartupBriefScreen />;
}
