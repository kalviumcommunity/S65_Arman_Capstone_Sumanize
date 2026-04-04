import { StartupsScreen } from "@/features/startups/startups-screen";
import { requireAuthenticatedPage } from "@/lib/require-authenticated-page";

export default async function StartupPage() {
  await requireAuthenticatedPage();

  return <StartupsScreen />;
}
