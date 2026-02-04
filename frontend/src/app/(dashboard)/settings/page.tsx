"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { LLMSettings } from "@/components/settings/LLMSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { createAppError, type AppError } from "@/lib/errors";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const searchParams = useSearchParams();

  const errorType = searchParams.get("error");

  const hydrate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      if (errorType === "network") {
        setError(createAppError("network"));
      } else if (errorType === "auth") {
        setError(createAppError("auth"));
      } else if (errorType === "invalid") {
        setError(createAppError("validation"));
      }
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [errorType]);

  useEffect(() => hydrate(), [hydrate]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account & workspace"
        title="Settings"
        description="Manage your profile, configure LLM providers, and customize how iOpsData runs."
      />

      {error ? (
        <ErrorMessage error={error} onRetry={hydrate} />
      ) : (
        <div className="space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton className="h-40 w-full" />
              <LoadingSkeleton className="h-40 w-full" />
              <LoadingSkeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <ProfileSettings />
              <LLMSettings />
              <PreferencesSettings />
            </>
          )}
        </div>
      )}
    </div>
  );
}
