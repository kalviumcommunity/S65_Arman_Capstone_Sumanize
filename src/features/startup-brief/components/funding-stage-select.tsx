import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fundingStages = ["Bootstrapped", "Pre-seed", "Seed", "Series A"] as const;

export function FundingStageSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const normalizedValue = (value ?? "").trim();
  const selected = normalizedValue === "" ? null : normalizedValue;

  return (
    <Select
      onValueChange={(nextValue) => onChange(nextValue ?? "")}
      value={selected}
    >
      <SelectTrigger className="w-full min-w-0">
        <SelectValue placeholder="Select funding stage" />
      </SelectTrigger>
      <SelectContent>
        {fundingStages.map((stage) => (
          <SelectItem key={stage} value={stage}>
            {stage}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
