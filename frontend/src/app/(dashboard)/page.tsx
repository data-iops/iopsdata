"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { createAppError, type AppError } from "@/lib/errors";

const stats = [
  {
    label: "Connections",
    value: "12",
    description: "3 new this week",
  },
  {
    label: "Recent queries",
    value: "58",
    description: "12 executed today",
  },
  {
    label: "Active files",
    value: "24",
    description: "Synced across teams",
  },
];

const conversations = [
  {
    title: "Infra cost optimization",
    detail: "Last active 10m ago",
  },
  {
    title: "Customer retention dashboard",
    detail: "Last active 2h ago",
  },
  {
    title: "Realtime alerts pipeline",
    detail: "Last active yesterday",
  },
];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

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

  if (error) {
    return <ErrorMessage error={error} onRetry={hydrate} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace overview"
        title="Operations Command Center"
        description="Monitor data pipelines, query context, and AI copilots from one workspace."
        actions={<Button className="w-full lg:w-auto">New conversation</Button>}
      />

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-3">
            <LoadingSkeleton className="h-6 w-48" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Workspace health is stable. Last sync completed 2 minutes ago.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Card key={`stat-skeleton-${index}`} className="border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-8 w-16" />
                </CardHeader>
                <CardContent>
                  <LoadingSkeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Recent conversations</CardTitle>
            <CardDescription>Pick up right where you left off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`conversation-skeleton-${index}`}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3"
                  >
                    <div className="space-y-2">
                      <LoadingSkeleton className="h-4 w-40" />
                      <LoadingSkeleton className="h-3 w-24" />
                    </div>
                    <LoadingSkeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                title="No conversations yet"
                description="Start a new conversation to explore your data."
                action={<Button>Start a conversation</Button>}
              />
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.title}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3 transition-colors hover:border-border"
                >
                  <div>
                    <p className="text-sm font-medium">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">{conversation.detail}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Shortcuts for your daily workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Connect a new data source
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Upload a dataset
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Invite a teammate
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
