"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { createAppError, type AppError } from "@/lib/errors";

function HomeContent() {
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
    }, 500);

    return () => clearTimeout(timer);
  }, [errorType]);

  useEffect(() => hydrate(), [hydrate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <ErrorMessage error={error} onRetry={hydrate} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton className="h-10 w-40" />
            <LoadingSkeleton className="h-5 w-72" />
            <div className="flex gap-4">
              <LoadingSkeleton className="h-10 w-28" />
              <LoadingSkeleton className="h-10 w-28" />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight">iOpsData</h1>
            <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
              AI-native data workspace. Query, analyze, and visualize your data with natural
              language.
            </p>
            <div className="flex gap-4">
              <a
                href="/signup"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Login
              </a>
              <a
                href="https://github.com/data-iops/iopsdata"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><LoadingSkeleton className="h-10 w-40" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
