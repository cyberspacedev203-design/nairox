import { CopyButton } from "@/components/CopyButton";

interface NarrationSectionProps {
  text?: string;
}

export const NarrationSection = ({ text = "Activation fee" }: NarrationSectionProps) => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Narration/Description</p>
          <p className="text-lg font-semibold">{text}</p>
        </div>
        <CopyButton text={text} label="Copy narration" />
      </div>
    </div>
  );
};
