import { cn } from "@/lib/utils";

export type LoadingSkeletonProps = {
  className?: string;
  label?: string;
};

export function LoadingSkeleton({
  className,
  label = "Loading content",
}: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("animate-pulse rounded-md bg-muted/40", className)}
    />
  );
}
