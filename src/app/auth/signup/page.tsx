"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, AtSign, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { validateSignUpForm } from "@/lib/auth/validation";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithPassword, error: globalAuthError, clearError } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitError(null);

    const formData = { displayName, username, email, password, confirmPassword };
    const validation = validateSignUpForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await signUpWithPassword(formData);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setSubmitError(result.error ?? "Sign up failed. Please review your details and try again.");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
      {/* Page Title & Subtitle */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Join Realtime Chat to connect with friends and teammates
        </p>
      </div>

      {/* Global Error Alert */}
      {(submitError || globalAuthError) && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-destructive text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{submitError || globalAuthError}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name Field */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-xs font-semibold">
            Display Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="displayName"
              type="text"
              placeholder="Nguyen Minh"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-9 text-sm"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.displayName && (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.displayName}</p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-semibold">
            Username
          </Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="nguyenminh"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="pl-9 text-sm"
              autoCapitalize="none"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.username ? (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.username}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Unique handle used for profile identification (3-20 letters, numbers, underscores).
            </p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-xs font-semibold">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10 text-sm"
              autoComplete="new-password"
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

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 text-sm"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-destructive font-medium">
              {fieldErrors.confirmPassword}
            </p>
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
              Creating account...
            </>
          ) : (
            "Complete Sign Up"
          )}
        </Button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
