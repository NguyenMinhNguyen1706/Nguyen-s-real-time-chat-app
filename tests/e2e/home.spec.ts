import { expect, test } from "@playwright/test";

test("home page renders the desktop application shell", async ({ page }) => {
  await page.goto("/");

  // Check 3-region layout elements
  await expect(page.getByRole("heading", { name: "Conversations" }).first()).toBeVisible();
  await expect(page.getByText("Realtime Chat").first()).toBeVisible();
  await expect(page.getByPlaceholder("Search messages...").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Open conversation with Frontend Engineering Team/i }).first()).toBeVisible();
});

test("selecting a conversation updates the main workspace state", async ({ page }) => {
  await page.goto("/");

  // Select "Sarah Chen" conversation
  const sarahRow = page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first();
  await expect(sarahRow).toBeVisible();
  await sarahRow.click();

  // Verify workspace header updates with selected conversation title
  await expect(page.getByRole("heading", { name: "Sarah Chen", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Active now").first()).toBeVisible();
});

test("toggles theme menu options", async ({ page }) => {
  await page.goto("/");

  const themeToggle = page.getByRole("button", { name: "Toggle theme" }).first();
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();

  await expect(page.getByRole("menuitem", { name: "Light" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Dark" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "System" })).toBeVisible();
});

test("mobile responsive shell handles list selection and navigation drawer", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  // Verify mobile header & conversation list
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
  const mobileSarahButton = page.locator("div.md\\:hidden").getByRole("button", { name: /Open conversation with Sarah Chen/i });
  await expect(mobileSarahButton).toBeVisible();

  // Select a conversation on mobile -> switches to chat view
  await mobileSarahButton.click();
  await expect(page.getByRole("heading", { name: "Sarah Chen", exact: true })).toBeVisible();

  // Click Back button on mobile chat view -> returns to conversation list
  const backButton = page.getByRole("button", { name: "Back to conversations" });
  await expect(backButton).toBeVisible();
  await backButton.click();

  await expect(page.locator("div.md\\:hidden").getByRole("heading", { name: "Conversations" })).toBeVisible();
});
