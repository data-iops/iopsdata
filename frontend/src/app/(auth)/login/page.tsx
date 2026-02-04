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


type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFormError(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthForm
      title="Welcome back"
      description="Sign in to continue building with iOpsData."
      submitLabel="Sign in"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      errorMessage={formError}
      footer={
        <div className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link className="text-accent hover:underline" href="/signup">
            Sign up
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
            autoComplete="current-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password ? (
            <p className="text-sm text-red-300">{errors.password.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link className="text-muted-foreground hover:text-foreground" href="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <OAuthButtons />
    </AuthForm>
  );
}
