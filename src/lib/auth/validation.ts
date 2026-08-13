/**
 * Form validation and error formatting utilities for Supabase Authentication
 */

export interface SignUpFormData {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) {
    return "Username is required";
  }
  if (trimmed.length < 3) {
    return "Username must be at least 3 characters long";
  }
  if (trimmed.length > 20) {
    return "Username must be 20 characters or less";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
}

export function validateSignUpForm(data: SignUpFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.displayName.trim()) {
    errors.displayName = "Display name is required";
  } else if (data.displayName.trim().length > 50) {
    errors.displayName = "Display name must be 50 characters or less";
  }

  const usernameErr = validateUsername(data.username);
  if (usernameErr) {
    errors.username = usernameErr;
  }

  const emailErr = validateEmail(data.email);
  if (emailErr) {
    errors.email = emailErr;
  }

  const passwordErr = validatePassword(data.password);
  if (passwordErr) {
    errors.password = passwordErr;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSignInForm(data: SignInFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const emailErr = validateEmail(data.email);
  if (emailErr) {
    errors.email = emailErr;
  }

  const passwordErr = validatePassword(data.password);
  if (passwordErr) {
    errors.password = passwordErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Maps raw Supabase Auth technical error strings to clean, user-friendly messages
 */
export function mapAuthError(rawError: string): string {
  const message = rawError.toLowerCase();

  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (message.includes("user already registered") || message.includes("already exists")) {
    return "An account with this email address already exists.";
  }
  if (message.includes("username already taken") || message.includes("username_exists")) {
    return "This username is already taken. Please choose another username.";
  }
  if (message.includes("email not confirmed")) {
    return "Your email address has not been confirmed yet. Please check your inbox.";
  }
  if (message.includes("too many requests") || message.includes("rate limit")) {
    return "Too many failed attempts. Please wait a moment before trying again.";
  }
  if (message.includes("network") || message.includes("fetch failed")) {
    return "Unable to reach the authentication server. Please check your internet connection.";
  }

  return rawError || "An unexpected error occurred during authentication. Please try again.";
}
