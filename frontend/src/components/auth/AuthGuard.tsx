"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/app/providers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type AuthGuardProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (!data.session) {
        router.replace(redirectTo);
      }
      setChecking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [redirectTo, router, supabase]);

  useEffect(() => {
    if (!checking && !session) {
      router.replace(redirectTo);
    }
  }, [checking, redirectTo, router, session]);

  if (checking || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  return <>{children}</>;
}
