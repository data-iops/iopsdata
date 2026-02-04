"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthForm({
  title,
  description,
  submitLabel,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  footer,
  children,
}: AuthFormProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-xl shadow-black/10 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          {errorMessage ? <ErrorMessage error={errorMessage} /> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" label="Submitting" />
                Working...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </CardContent>
      {footer ? (
        <CardFooter className={cn("flex flex-col gap-2 text-sm", "pt-0")}>
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
