import { expect, test } from "@playwright/test";

test.describe("Chat View + Message Timeline", () => {
  test("selects a conversation and renders chat header and message timeline", async ({ page }) => {
    await page.goto("/");

    // Click on Sarah Chen conversation in desktop shell
    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    // Verify Chat Header
    await expect(
      desktopContainer.getByRole("heading", { name: "Sarah Chen", exact: true }),
    ).toBeVisible();
    await expect(desktopContainer.getByText("Active now")).toBeVisible();

    // Verify Message Timeline & Date Separator
    await expect(desktopContainer.getByRole("log", { name: "Message timeline" })).toBeVisible();
    await expect(
      desktopContainer.getByText("Hi Nguyen! How is the real-time chat architecture coming along?"),
    ).toBeVisible();

    // Verify Typing Indicator
    await expect(desktopContainer.getByText("Sarah Chen is typing...")).toBeVisible();

    // Verify Active Message Composer
    await expect(
      desktopContainer.getByPlaceholder("Write a message to Sarah Chen..."),
    ).toBeVisible();
  });

  test("renders empty chat state for conversation with no messages", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");

    // Click on Archived conversation which has no messages in mock message map
    const archivedTab = desktopContainer.getByRole("tab", { name: "Archived" });
    await archivedTab.click();

    const archivedBtn = desktopContainer.getByRole("button", {
      name: /Open conversation with Archived Project Alpha/i,
    });
    await archivedBtn.click();

    await expect(
      desktopContainer.getByText("No messages yet with Archived Project Alpha"),
    ).toBeVisible();
  });

  test("handles mobile navigation opening conversation and returning via back button", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const mobileContainer = page.locator("div.md\\:hidden");
    const mobileSarahBtn = mobileContainer.getByRole("button", {
      name: /Open conversation with Sarah Chen/i,
    });
    await mobileSarahBtn.click();

    await expect(
      mobileContainer.getByRole("heading", { name: "Sarah Chen", exact: true }),
    ).toBeVisible();
    await expect(
      mobileContainer.getByText("Hi Nguyen! How is the real-time chat architecture coming along?"),
    ).toBeVisible();

    // Click back button
    const backBtn = mobileContainer.getByRole("button", { name: "Back to conversations" });
    await backBtn.click();

    await expect(mobileContainer.getByRole("heading", { name: "Conversations" })).toBeVisible();
  });
});
