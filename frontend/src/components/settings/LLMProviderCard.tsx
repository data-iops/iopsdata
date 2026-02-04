"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type LLMProviderCardProps = {
  name: string;
  description: string;
  freeTier: string;
  status: "configured" | "not_configured";
  setupUrl: string;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  logo: ReactNode;
};

export function LLMProviderCard({
  name,
  description,
  freeTier,
  status,
  setupUrl,
  apiKey,
  onApiKeyChange,
  logo,
}: LLMProviderCardProps) {
  const isConfigured = status === "configured";

  return (
    <Card className="border-border/60 bg-background/40">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg">
              {logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{name}</p>
                <span
                  className={
                    isConfigured
                      ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {isConfigured ? "Configured" : "Not configured"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={setupUrl} className="text-xs text-accent hover:underline">
            Quick setup
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr,auto]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">API key</label>
            <Input
              type="password"
              placeholder="••••••••••••••••"
              value={apiKey}
              onChange={(event) => onApiKeyChange(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button variant="outline" className="w-full">
              Test
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Free tier: {freeTier}</span>
          <Link href={setupUrl} className="text-accent hover:underline">
            Learn more
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
