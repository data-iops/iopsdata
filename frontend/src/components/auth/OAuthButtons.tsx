"use client";

import { useState } from "react";
import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/app/providers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useFeedbackToast } from "@/components/feedback/ToastNotifications";

export function OAuthButtons() {
  const { supabase } = useSupabase();
  const { notifyError } = useFeedbackToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHub = async () => {
    setIsLoading(true);
    const redirectTo = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
      },
    });

    if (error) {
      notifyError(error, { title: "GitHub sign-in failed" });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGitHub}
        disabled={isLoading}
        aria-label="Continue with GitHub"
      >
        <Github className="h-4 w-4" />
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" label="Connecting" />
            Connecting...
          </>
        ) : (
          "GitHub"
        )}
      </Button>
    </div>
  );
}
