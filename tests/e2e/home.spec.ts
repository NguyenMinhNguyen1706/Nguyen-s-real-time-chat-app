import { expect, test } from "@playwright/test";

test("home page renders the application shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conversations" })).toBeVisible();
  await expect(page.getByText("Realtime Chat")).toBeVisible();
  await expect(page.getByText("No conversations yet")).toBeVisible();
});
