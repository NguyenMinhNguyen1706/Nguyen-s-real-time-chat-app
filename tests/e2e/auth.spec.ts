import { expect, test } from "@playwright/test";

test.describe("Authentication UX & Form Behavior", () => {
  test("renders sign in page correctly", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });

  test("renders sign up page correctly", async ({ page }) => {
    await page.goto("/auth/signup");

    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
    await expect(page.getByLabel("Display Name")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Complete Sign Up" })).toBeVisible();
  });

  test("shows inline validation errors for invalid signup input", async ({ page }) => {
    await page.goto("/auth/signup");

    // Click submit with empty fields
    await page.getByRole("button", { name: "Complete Sign Up" }).click();

    await expect(page.getByText("Display name is required")).toBeVisible();
    await expect(page.getByText("Username is required")).toBeVisible();
    await expect(page.getByText("Email address is required")).toBeVisible();
  });

  test("validates password match on sign up", async ({ page }) => {
    await page.goto("/auth/signup");

    await page.getByLabel("Display Name").fill("Test User");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.locator("input#password").fill("password123");
    await page.getByLabel("Confirm Password").fill("differentpassword");

    await page.getByRole("button", { name: "Complete Sign Up" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("toggles password visibility on click", async ({ page }) => {
    await page.goto("/auth/login");

    const passwordInput = page.locator("input#password");
    await passwordInput.fill("secret123");

    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = page.getByRole("button", { name: "Show password" });
    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute("type", "text");
  });

  test("navigates seamlessly between sign in and sign up", async ({ page }) => {
    await page.goto("/auth/login");

    await Promise.all([
      page.waitForURL("**/auth/signup"),
      page.getByRole("link", { name: "Sign Up" }).click(),
    ]);
    expect(page.url()).toContain("/auth/signup");

    await Promise.all([
      page.waitForURL("**/auth/login"),
      page.getByRole("link", { name: "Sign In" }).click(),
    ]);
    expect(page.url()).toContain("/auth/login");
  });
});
