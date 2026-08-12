import { expect, test } from "@playwright/test";

test.describe("Profile & Settings Interactivity", () => {
  test("navigates to settings profile, edits display name & status, and verifies local update", async ({
    page,
  }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");

    // Click Settings icon in NavRail with exact matching
    const settingsTabBtn = desktopContainer.getByRole("button", { name: "Settings", exact: true });
    await settingsTabBtn.click();

    // Verify Settings page header
    const mainWorkspace = desktopContainer.getByRole("main", { name: "Settings workspace" });
    await expect(mainWorkspace.getByRole("heading", { name: "My Profile" })).toBeVisible();

    // Edit Display Name
    const nameInput = mainWorkspace.getByRole("textbox", { name: "Display Name *" });
    await nameInput.fill("Nguyen Architect Pro");

    // Edit Personal Status
    const statusInput = mainWorkspace.getByRole("textbox", { name: "Personal Status" });
    await statusInput.fill("Coding production chat app");

    // Save changes
    const saveBtn = mainWorkspace.getByRole("button", { name: "Save Changes" });
    await saveBtn.click();

    await expect(mainWorkspace.getByText("Saved!")).toBeVisible();

    // Verify profile heading reflects updated name
    await expect(
      mainWorkspace.getByRole("heading", { name: "Nguyen Architect Pro" }),
    ).toBeVisible();
  });

  test("switches presence status to Busy and updates badge label", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const settingsTabBtn = desktopContainer.getByRole("button", { name: "Settings", exact: true });
    await settingsTabBtn.click();

    const mainWorkspace = desktopContainer.getByRole("main", { name: "Settings workspace" });

    // Click 'Busy' presence button
    const busyBtn = mainWorkspace.getByRole("button", { name: "Set status to Busy" });
    await busyBtn.click();

    // Save changes
    const saveBtn = mainWorkspace.getByRole("button", { name: "Save Changes" });
    await saveBtn.click();

    await expect(mainWorkspace.getByText("Busy").first()).toBeVisible();
  });

  test("switches theme mode and toggles notification preferences", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const settingsTabBtn = desktopContainer.getByRole("button", { name: "Settings", exact: true });
    await settingsTabBtn.click();

    const mainWorkspace = desktopContainer.getByRole("main", { name: "Settings workspace" });

    // Open Appearance section
    const appearanceCategoryBtn = mainWorkspace.getByRole("button", {
      name: "Open Appearance settings",
    });
    await appearanceCategoryBtn.click();

    await expect(
      mainWorkspace.getByRole("heading", { name: "Appearance", level: 3 }),
    ).toBeVisible();

    // Select Dark Theme
    const darkThemeBtn = mainWorkspace.getByRole("button", { name: "Select Dark theme" });
    await darkThemeBtn.click();

    // Open Notifications section
    const notifCategoryBtn = mainWorkspace.getByRole("button", {
      name: "Open Notifications settings",
    });
    await notifCategoryBtn.click();

    await expect(
      mainWorkspace.getByRole("heading", { name: "Notifications", level: 3 }),
    ).toBeVisible();

    // Toggle Desktop Notifications
    const desktopNotifCheckbox = mainWorkspace.getByRole("checkbox", {
      name: "Toggle Desktop Notifications",
    });
    await desktopNotifCheckbox.click();
  });

  test("executes reset defaults in Danger Zone with confirmation dialog", async ({ page }) => {
    await page.goto("/");

    const desktopContainer = page.locator("div.hidden.md\\:flex");
    const settingsTabBtn = desktopContainer.getByRole("button", { name: "Settings", exact: true });
    await settingsTabBtn.click();

    const mainWorkspace = desktopContainer.getByRole("main", { name: "Settings workspace" });

    // Open Danger Zone
    const dangerCategoryBtn = mainWorkspace.getByRole("button", {
      name: "Open Danger Zone settings",
    });
    await dangerCategoryBtn.click();

    await expect(
      mainWorkspace.getByRole("heading", { name: "Danger Zone", level: 3 }),
    ).toBeVisible();

    // Click Reset Profile button
    const resetProfileBtn = mainWorkspace.getByRole("button", { name: "Reset local profile" });
    await resetProfileBtn.click();

    // Confirmation dialog appears
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Reset Local Profile?" })).toBeVisible();

    // Confirm reset
    const confirmBtn = dialog.getByRole("button", { name: "Confirm Reset" });
    await confirmBtn.click();

    await expect(
      mainWorkspace.getByText("Local profile has been reset to defaults."),
    ).toBeVisible();
  });
});
