import { describe, expect, it } from "vitest";

import {
  mapAuthError,
  validateEmail,
  validatePassword,
  validateSignInForm,
  validateSignUpForm,
  validateUsername,
} from "@/lib/auth/validation";

describe("Authentication Form Validation Utilities", () => {
  describe("validateUsername", () => {
    it("should accept valid usernames", () => {
      expect(validateUsername("nguyen_minh")).toBeNull();
      expect(validateUsername("alex123")).toBeNull();
      expect(validateUsername("sarah_chen_99")).toBeNull();
    });

    it("should reject empty username", () => {
      expect(validateUsername("  ")).toBe("Username is required");
    });

    it("should reject usernames shorter than 3 characters", () => {
      expect(validateUsername("ab")).toBe("Username must be at least 3 characters long");
    });

    it("should reject usernames longer than 20 characters", () => {
      expect(validateUsername("a".repeat(21))).toBe("Username must be 20 characters or less");
    });

    it("should reject usernames with special characters or spaces", () => {
      expect(validateUsername("user-name")).toBe(
        "Username can only contain letters, numbers, and underscores",
      );
      expect(validateUsername("user name")).toBe(
        "Username can only contain letters, numbers, and underscores",
      );
      expect(validateUsername("user@name")).toBe(
        "Username can only contain letters, numbers, and underscores",
      );
    });
  });

  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBeNull();
      expect(validateEmail("user.name+tag@sub.domain.co.uk")).toBeNull();
    });

    it("should reject empty email", () => {
      expect(validateEmail("")).toBe("Email address is required");
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("invalid-email")).toBe("Please enter a valid email address");
      expect(validateEmail("user@domain")).toBe("Please enter a valid email address");
      expect(validateEmail("@domain.com")).toBe("Please enter a valid email address");
    });
  });

  describe("validatePassword", () => {
    it("should accept valid passwords of 6+ characters", () => {
      expect(validatePassword("123456")).toBeNull();
      expect(validatePassword("secure_pass_123")).toBeNull();
    });

    it("should reject passwords shorter than 6 characters", () => {
      expect(validatePassword("12345")).toBe("Password must be at least 6 characters long");
    });
  });

  describe("validateSignUpForm", () => {
    it("should pass when all fields are valid and passwords match", () => {
      const result = validateSignUpForm({
        displayName: "Nguyen Minh",
        username: "nguyenminh",
        email: "nguyen@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should report errors when passwords do not match", () => {
      const result = validateSignUpForm({
        displayName: "Nguyen Minh",
        username: "nguyenminh",
        email: "nguyen@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe("Passwords do not match");
    });
  });

  describe("validateSignInForm", () => {
    it("should pass for valid sign in credentials", () => {
      const result = validateSignInForm({
        email: "nguyen@example.com",
        password: "password123",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should report invalid email error", () => {
      const result = validateSignInForm({
        email: "bad-email",
        password: "password123",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe("Please enter a valid email address");
    });
  });

  describe("mapAuthError", () => {
    it("should map invalid credentials to user friendly text", () => {
      expect(mapAuthError("Invalid login credentials")).toContain("Invalid email or password");
    });

    it("should map user already registered error", () => {
      expect(mapAuthError("User already registered")).toContain("already exists");
    });

    it("should map username exists error", () => {
      expect(mapAuthError("Username already taken")).toContain("already taken");
    });
  });
});
