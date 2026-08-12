import { expect, test } from "@playwright/test";

test("home page renders the application shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conversations" })).toBeVisible();
  await expect(page.getByText("Realtime Chat")).toBeVisible();
  await expect(page.getByText("No conversations yet")).toBeVisible();
});

test("toggles theme menu options", async ({ page }) => {
  await page.goto("/");

  const themeToggle = page.getByRole("button", { name: "Toggle theme" });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();

  await expect(page.getByRole("menuitem", { name: "Light" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Dark" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "System" })).toBeVisible();
});

test("mobile view renders mobile sidebar trigger button", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open conversation list" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  await expect(page.getByRole("navigation", { name: "Conversation list" })).toBeVisible();
});
