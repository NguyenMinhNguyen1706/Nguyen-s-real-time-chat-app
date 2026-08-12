import { expect, test } from "@playwright/test";

test.describe("Message Composer Interactivity", () => {
  test("types a message and sends it to the timeline", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const composerInput = desktopContainer.getByRole("textbox", {
      name: "Message composer input",
    });
    const sendButton = desktopContainer.getByRole("button", { name: "Send message" });

    // Send button initially disabled when empty
    await expect(sendButton).toBeDisabled();

    // Type message
    await composerInput.fill("Automated Playwright test message!");
    await expect(sendButton).toBeEnabled();

    // Send message
    await sendButton.click();

    // Input clears after sending
    await expect(composerInput).toHaveValue("");

    // Message appears immediately on timeline log
    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });
    await expect(timelineLog.getByText("Automated Playwright test message!")).toBeVisible();
  });

  test("sends message via Enter key and supports Shift+Enter for multiline", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const composerInput = desktopContainer.getByRole("textbox", {
      name: "Message composer input",
    });

    // Multiline typing with Shift+Enter
    await composerInput.focus();
    await composerInput.type("First line");
    await page.keyboard.press("Shift+Enter");
    await composerInput.type("Second line");

    // Press Enter to send
    await page.keyboard.press("Enter");

    await expect(composerInput).toHaveValue("");

    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });
    await expect(timelineLog.getByText("First line\nSecond line")).toBeVisible();
  });

  test("opens emoji picker and inserts emoji at cursor position", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const emojiTrigger = desktopContainer.getByRole("button", { name: "Add emoji" });
    await emojiTrigger.click();

    // Emoji popover appears
    await expect(page.getByText("Emoji Picker")).toBeVisible();

    // Pick thumbs up emoji
    const thumbsUpBtn = page.getByRole("button", { name: "Select emoji 👍" });
    await thumbsUpBtn.click();

    const composerInput = desktopContainer.getByRole("textbox", {
      name: "Message composer input",
    });
    await expect(composerInput).toHaveValue("👍");
  });

  test("attaches a file and displays attachment preview chip with remove option", async ({
    page,
  }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    // Set file input attachment
    const fileInput = desktopContainer.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-document.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("PDF file content"),
    });

    // Attachment chip appears
    await expect(desktopContainer.getByText("test-document.pdf")).toBeVisible();

    // Send button becomes enabled due to attachment
    const sendButton = desktopContainer.getByRole("button", { name: "Send message" });
    await expect(sendButton).toBeEnabled();

    // Remove attachment
    const removeBtn = desktopContainer.getByRole("button", { name: "Remove attachment" });
    await removeBtn.click();

    await expect(desktopContainer.getByText("test-document.pdf")).toHaveCount(0);
  });
});
