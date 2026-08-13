"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { validateSignInForm } from "@/lib/auth/validation";

export default function LoginPage() {
  const router = Router();
  const { signInWithPassword, error: globalAuthError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitError(null);

    const validation = validateSignInForm({ email, password });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setSubmitError(result.error ?? "Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
      {/* Page Title & Subtitle */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue chatting
        </p>
      </div>

      {/* Global Error Alert */}
      {(submitError || globalAuthError) && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{submitError || globalAuthError}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 text-sm"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10 text-sm"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full text-sm font-semibold h-10 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

function Router() {
  return useRouter();
}
