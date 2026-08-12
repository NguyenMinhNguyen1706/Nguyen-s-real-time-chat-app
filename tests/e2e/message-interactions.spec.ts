import { expect, test } from "@playwright/test";

test.describe("Message Interactions (Reactions, Reply, Edit, Delete)", () => {
  test("hovers over a message to expose actions and toggles a reaction pill", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });

    // Hover over Sarah's message in timeline log
    const msg = timelineLog
      .getByText("Hi Nguyen! How is the real-time chat architecture coming along?")
      .first();
    await msg.hover();

    const hoverToolbar = desktopContainer.getByRole("region", { name: "Message action toolbar" });
    await expect(hoverToolbar).toBeVisible();

    // Add reaction
    const addReactionBtn = hoverToolbar.getByRole("button", { name: "Add reaction" });
    await addReactionBtn.click();

    const thumbsUpBtn = page.getByRole("button", { name: "React with 👍" });
    await thumbsUpBtn.click();

    // Reaction pill visible under message
    const reactionPill = desktopContainer.getByRole("button", { name: /Reaction 👍/i });
    await expect(reactionPill).toBeVisible();

    // Click pill to toggle off
    await reactionPill.click();
    await expect(reactionPill).toHaveCount(0);
  });

  test("triggers reply action, populates reply preview above composer, and sends quoted reply", async ({
    page,
  }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });

    // Hover and click reply on Sarah's message in timeline log
    const msg = timelineLog
      .getByText("Hi Nguyen! How is the real-time chat architecture coming along?")
      .first();
    await msg.hover();

    const hoverToolbar = desktopContainer.getByRole("region", { name: "Message action toolbar" });
    const replyBtn = hoverToolbar.getByRole("button", { name: "Reply to message" });
    await replyBtn.click();

    // Active reply preview bar above composer
    const replyBar = desktopContainer.getByRole("group", {
      name: /Replying to message from Sarah Chen/i,
    });
    await expect(replyBar).toBeVisible();

    // Send reply message
    const composerInput = desktopContainer.getByRole("textbox", {
      name: "Message composer input",
    });
    await composerInput.fill("Architecture is fully ready!");
    const sendButton = desktopContainer.getByRole("button", { name: "Send message" });
    await sendButton.click();

    // Reply bar closes
    await expect(replyBar).toHaveCount(0);

    // Timeline bubble shows quoted preview
    await expect(timelineLog.getByText("Architecture is fully ready!")).toBeVisible();
    await expect(
      timelineLog.getByRole("button", { name: /Scroll to original message from Sarah Chen/i }),
    ).toBeVisible();
  });

  test("edits an outgoing message inline and marks it as edited", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });

    // Hover over outgoing message in timeline log
    const outgoingMsg = timelineLog
      .getByText("I am reviewing it right now. Everything looks solid!")
      .first();
    await outgoingMsg.hover();

    const hoverToolbar = desktopContainer.getByRole("region", { name: "Message action toolbar" });
    const moreBtn = hoverToolbar.getByRole("button", { name: "More message options" });
    await moreBtn.click();

    const editItem = page.getByRole("menuitem", { name: "Edit" });
    await editItem.click();

    // Inline textarea editor appears
    const editor = desktopContainer.getByRole("textbox", { name: "Edit message input" });
    await expect(editor).toBeVisible();
    await editor.fill("Updated text via inline editor!");

    const saveBtn = desktopContainer.getByRole("button", { name: "Save" });
    await saveBtn.click();

    // Content updated and (edited) tag present
    await expect(timelineLog.getByText("Updated text via inline editor!")).toBeVisible();
    await expect(timelineLog.getByText("(edited)")).toBeVisible();
  });

  test("deletes an outgoing message with confirmation dialog", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const sarahBtn = desktopContainer
      .getByRole("button", { name: /Open conversation with Sarah Chen/i })
      .first();
    await sarahBtn.click();

    const timelineLog = desktopContainer.getByRole("log", { name: "Message timeline" });

    // First send a test message to delete
    const composerInput = desktopContainer.getByRole("textbox", {
      name: "Message composer input",
    });
    await composerInput.fill("Temporary message to delete");
    const sendButton = desktopContainer.getByRole("button", { name: "Send message" });
    await sendButton.click();

    const tempMsg = timelineLog.getByText("Temporary message to delete").first();
    await tempMsg.hover();

    const hoverToolbar = desktopContainer.getByRole("region", { name: "Message action toolbar" });
    const moreBtn = hoverToolbar.getByRole("button", { name: "More message options" });
    await moreBtn.click();

    const deleteItem = page.getByRole("menuitem", { name: "Delete" });
    await deleteItem.click();

    // Dialog confirmation appears
    await expect(page.getByRole("heading", { name: "Delete message" })).toBeVisible();

    const confirmDeleteBtn = page.getByRole("button", { name: "Delete", exact: true });
    await confirmDeleteBtn.click();

    // Message removed from timeline
    await expect(timelineLog.getByText("Temporary message to delete")).toHaveCount(0);
  });
});
