import { expect, test } from "@playwright/test";

test("renders initial conversation list with pinned section", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conversations" }).first()).toBeVisible();
  await expect(page.getByText("Pinned").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open conversation with Frontend Engineering Team/i }).first(),
  ).toBeVisible();
});

test("filters by unread tab", async ({ page }) => {
  await page.goto("/");

  const unreadTab = page.getByRole("tab", { name: "Unread" }).first();
  await unreadTab.click();

  await expect(
    page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open conversation with Alex Rivers/i }),
  ).toHaveCount(0);
});

test("filters by favorites tab", async ({ page }) => {
  await page.goto("/");

  const favTab = page.getByRole("tab", { name: "Favorites" }).first();
  await favTab.click();

  await expect(
    page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first(),
  ).toBeVisible();
});

test("filters by archived tab", async ({ page }) => {
  await page.goto("/");

  const archivedTab = page.getByRole("tab", { name: "Archived" }).first();
  await archivedTab.click();

  await expect(
    page.getByRole("button", { name: /Open conversation with Archived Project Alpha/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Open conversation with Sarah Chen/i }),
  ).toHaveCount(0);
});

test("search filters conversation list and shows empty search state when no match", async ({
  page,
}) => {
  await page.goto("/");

  const searchInput = page.getByPlaceholder("Search messages & contacts...").first();
  await searchInput.fill("NonExistentNameXYZ");

  await expect(page.getByText("No conversations found").first()).toBeVisible();
  await expect(page.getByText('No matches for "NonExistentNameXYZ"').first()).toBeVisible();

  // Clear search filter
  await page.getByRole("button", { name: "Clear search filter" }).first().click();
  await expect(
    page.getByRole("button", { name: /Open conversation with Sarah Chen/i }).first(),
  ).toBeVisible();
});

test("mobile responsive shell handles conversation list selection and back navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");

  const mobileSarahButton = page
    .locator("div.md\\:hidden")
    .getByRole("button", { name: /Open conversation with Sarah Chen/i });
  await expect(mobileSarahButton).toBeVisible();

  // Select conversation on mobile
  await mobileSarahButton.click();
  await expect(page.getByRole("heading", { name: "Sarah Chen", exact: true })).toBeVisible();

  // Return to conversation list via back button
  const backButton = page.getByRole("button", { name: "Back to conversations" });
  await expect(backButton).toBeVisible();
  await backButton.click();

  await expect(
    page.locator("div.md\\:hidden").getByRole("heading", { name: "Conversations" }),
  ).toBeVisible();
});
