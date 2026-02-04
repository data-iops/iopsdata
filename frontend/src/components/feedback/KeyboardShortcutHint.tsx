import { cn } from "@/lib/utils";

export type KeyboardShortcutHintProps = {
  keys: string[];
  description: string;
  className?: string;
};

export function KeyboardShortcutHint({
  keys,
  description,
  className,
}: KeyboardShortcutHintProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex flex-wrap items-center gap-1">
        {keys.map((key) => (
          <kbd
            key={key}
            className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-semibold text-foreground"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}
