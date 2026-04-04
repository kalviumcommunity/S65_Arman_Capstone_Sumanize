import { WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function StreamErrorAlert({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }

  return (
    <Alert
      variant="destructive"
      className="mt-4 border-destructive/30 bg-destructive/10"
    >
      <WarningCircle size={16} weight="fill" />
      <AlertTitle>Stream failed</AlertTitle>
      <AlertDescription className="text-destructive">{error}</AlertDescription>
    </Alert>
  );
}
