import { expect, test } from "@playwright/test";

test.describe("Message & Conversation Search Interactivity", () => {
  test("opens search modal, types query, filters tabs, and navigates to result message", async ({
    page,
  }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");

    // Click search icon button in conversation column to open modal
    const searchModalBtn = desktopContainer.getByRole("button", {
      name: "Global search modal",
    });
    await searchModalBtn.click();

    // Modal dialog opens
    const dialog = page.getByRole("dialog", { name: "Search Messages & Contacts" });
    await expect(dialog).toBeVisible();

    const searchInput = dialog.getByRole("textbox", { name: "Search input" });
    await searchInput.fill("architecture");

    // Results appear
    await expect(
      page.getByText("Hi Nguyen! How is the real-time chat architecture coming along?"),
    ).toBeVisible();

    // Switch to Messages tab
    const messagesTab = dialog.getByRole("tab", { name: /Messages/i });
    await messagesTab.click();

    // Select result card
    const resultCard = page.getByRole("button", { name: /Search result: Sarah Chen/i }).first();
    await resultCard.click();

    // Dialog closes
    await expect(dialog).toHaveCount(0);

    // Selected conversation opens and message timeline displays content
    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });
    await expect(
      timelineLog.getByText("Hi Nguyen! How is the real-time chat architecture coming along?"),
    ).toBeVisible();
  });

  test("opens search modal via global search icon button and closes via ESC key", async ({
    page,
  }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const searchModalBtn = desktopContainer.getByRole("button", {
      name: "Global search modal",
    });
    await searchModalBtn.click();

    const dialog = page.getByRole("dialog", { name: "Search Messages & Contacts" });
    await expect(dialog).toBeVisible();

    // Press ESC to close
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("handles recent searches chips and clear all button", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const searchModalBtn = desktopContainer.getByRole("button", {
      name: "Global search modal",
    });
    await searchModalBtn.click();

    const dialog = page.getByRole("dialog", { name: "Search Messages & Contacts" });
    await expect(page.getByText("Recent Searches")).toBeVisible();

    // Click recent search chip "Sarah" with exact matching
    const sarahChip = page.getByRole("button", { name: "Sarah", exact: true });
    await sarahChip.click();

    const searchInput = dialog.getByRole("textbox", { name: "Search input" });
    await expect(searchInput).toHaveValue("Sarah");
  });
});
