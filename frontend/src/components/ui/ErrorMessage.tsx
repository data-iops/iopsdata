import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getErrorMessage, getErrorTitle, type AppError } from "@/lib/errors";

export type ErrorMessageProps = {
  error?: AppError | Error | string | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function ErrorMessage({
  error,
  title,
  description,
  onRetry,
  retryLabel = "Retry",
  className,
}: ErrorMessageProps) {
  const fallbackError =
    typeof error === "string" ? { type: "unknown", message: error } : error;

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-5 text-red-100",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-red-500/20 p-2">
          <AlertTriangle className="h-5 w-5 text-red-200" />
        </span>
        <div>
          <p className="text-sm font-semibold">{title ?? getErrorTitle(fallbackError)}</p>
          <p className="text-sm text-red-100/80">
            {description ?? getErrorMessage(fallbackError)}
          </p>
        </div>
      </div>
      {onRetry ? (
        <div>
          <Button variant="outline" onClick={onRetry} className="border-red-500/40">
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
