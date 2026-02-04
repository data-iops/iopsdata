"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { AuthForm } from "@/components/auth/AuthForm";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/app/providers";
import { useFeedbackToast } from "@/components/feedback/ToastNotifications";


type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const { supabase } = useSupabase();
  const { notifyError, notifySuccess } = useFeedbackToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFormError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setFormError(error.message);
      notifyError(error, { title: "Reset failed" });
      return;
    }

    notifySuccess({
      title: "Check your email",
      description: "We sent a password reset link to your inbox.",
    });
  };

  return (
    <AuthForm
      title="Reset your password"
      description="Send a reset link to your email address."
      submitLabel="Send reset link"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      errorMessage={formError}
      footer={
        <div className="text-center text-muted-foreground">
          Remembered your password?{" "}
          <Link className="text-accent hover:underline" href="/login">
            Back to sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@iopsdata.com"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />
        {errors.email ? (
          <p className="text-sm text-red-300">{errors.email.message}</p>
        ) : null}
      </div>
    </AuthForm>
  );
}
