"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthForm } from "@/components/auth/AuthForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/app/providers";
import { useToast } from "@/components/ui/use-toast";


type SignupFormValues = {
  email: string;
  password: string;
  terms: boolean;
};

export default function SignupPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      email: "",
      password: "",
      terms: false,
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setFormError(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setFormError(error.message);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "Check your email to confirm your account.",
    });
    router.push("/dashboard");
  };

  return (
    <AuthForm
      title="Create your account"
      description="Join iOpsData and start working with your data instantly."
      submitLabel="Sign up"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      errorMessage={formError}
      footer={
        <div className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-accent hover:underline" href="/login">
            Sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
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
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password ? (
            <p className="text-sm text-red-300">{errors.password.message}</p>
          ) : null}
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border border-border bg-input text-accent focus:ring-2 focus:ring-accent"
            {...register("terms", {
              required: "You must accept the terms to continue",
            })}
          />
          <span>
            I agree to the iOpsData terms and acknowledge the privacy policy.
          </span>
        </label>
        {errors.terms ? (
          <p className="text-sm text-red-300">{errors.terms.message}</p>
        ) : null}
      </div>

      <OAuthButtons />
    </AuthForm>
  );
}
