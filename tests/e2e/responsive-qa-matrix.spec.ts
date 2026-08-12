import { expect, test } from "@playwright/test";

const REPRESENTATIVE_VIEWPORTS = [
  { name: "320x844 (Small Mobile)", width: 320, height: 844 },
  { name: "360x800 (Android Mobile)", width: 360, height: 800 },
  { name: "375x812 (iPhone SE)", width: 375, height: 812 },
  { name: "390x844 (iPhone 13/14)", width: 390, height: 844 },
  { name: "430x932 (iPhone Pro Max)", width: 430, height: 932 },
  { name: "768x1024 (Tablet Portrait)", width: 768, height: 1024 },
  { name: "834x1112 (iPad Air)", width: 834, height: 1112 },
  { name: "1024x768 (Tablet Landscape)", width: 1024, height: 768 },
  { name: "1280x800 (Laptop)", width: 1280, height: 800 },
  { name: "1440x900 (Desktop)", width: 1440, height: 900 },
  { name: "1536x864 (Large Desktop)", width: 1536, height: 864 },
];

test.describe("TASK 09 — Responsive Browser QA Matrix", () => {
  REPRESENTATIVE_VIEWPORTS.forEach((vp) => {
    test(`verifies layout integrity at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");

      // Verify no horizontal document overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 1);

      if (vp.width < 768) {
        // Mobile view - navigation menu toggle is visible
        await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();

        // Select Sarah Chen conversation button
        const mobileSarahButton = page
          .locator("div.md\\:hidden")
          .getByRole("button", { name: /Open conversation with Sarah Chen/i });
        await mobileSarahButton.click();

        // Chat header & back button should be visible
        await expect(page.getByRole("button", { name: "Back to conversations" })).toBeVisible();

        // Return to conversation list
        await page.getByRole("button", { name: "Back to conversations" }).click();
        await expect(mobileSarahButton).toBeVisible();
      } else {
        // Desktop / Tablet view - conversation column heading is visible
        await expect(page.getByRole("heading", { name: "Conversations" }).first()).toBeVisible();
      }
    });
  });

  test("verifies settings workspace layout on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const settingsBtn = desktopContainer.getByRole("button", { name: "Settings", exact: true });
    await settingsBtn.click();

    const mainWorkspace = desktopContainer.getByRole("main", { name: "Settings workspace" });
    await expect(mainWorkspace.getByRole("heading", { name: "My Profile" })).toBeVisible();
  });
});
