"use client";

import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/errors";

type ToastOptions = {
  title: string;
  description?: string;
};

export function useFeedbackToast() {
  const { toast } = useToast();

  const notifySuccess = ({ title, description }: ToastOptions) =>
    toast({
      title,
      description,
    });

  const notifyInfo = ({ title, description }: ToastOptions) =>
    toast({
      title,
      description,
    });

  const notifyError = (error: unknown, fallback?: ToastOptions) =>
    toast({
      title: fallback?.title ?? "Something went wrong",
      description: fallback?.description ?? getErrorMessage(error),
      variant: "destructive",
    });

  return { toast, notifySuccess, notifyError, notifyInfo };
}

export function ToastNotifications() {
  return <Toaster />;
}
