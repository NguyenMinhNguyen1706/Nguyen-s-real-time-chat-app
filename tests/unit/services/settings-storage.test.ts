import { beforeEach, describe, expect, it } from "vitest";

import {
  loadUserProfile,
  loadUserSettings,
  resetUserProfileStorage,
  resetUserSettingsStorage,
  saveUserProfile,
  saveUserSettings,
} from "@/lib/settings-storage";
import { DEFAULT_USER_PROFILE, DEFAULT_USER_SETTINGS } from "@/types/settings";

function createMockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe("Settings Storage Unit Tests", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: globalThis,
      writable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: createMockLocalStorage(),
      writable: true,
    });
    localStorage.clear();
  });

  it("loads default profile when localStorage is empty", () => {
    const profile = loadUserProfile();
    expect(profile).toEqual(DEFAULT_USER_PROFILE);
  });

  it("saves and loads updated user profile", () => {
    const updated = {
      ...DEFAULT_USER_PROFILE,
      name: "Architect Nguyen",
      presenceStatus: "busy" as const,
    };
    saveUserProfile(updated);

    const loaded = loadUserProfile();
    expect(loaded.name).toBe("Architect Nguyen");
    expect(loaded.presenceStatus).toBe("busy");
  });

  it("loads default user settings when localStorage is empty", () => {
    const settings = loadUserSettings();
    expect(settings).toEqual(DEFAULT_USER_SETTINGS);
  });

  it("saves and loads custom user settings", () => {
    const custom = {
      ...DEFAULT_USER_SETTINGS,
      appearance: { theme: "dark" as const, density: "compact" as const, reducedMotion: true },
    };
    saveUserSettings(custom);

    const loaded = loadUserSettings();
    expect(loaded.appearance.theme).toBe("dark");
    expect(loaded.appearance.density).toBe("compact");
    expect(loaded.appearance.reducedMotion).toBe(true);
  });

  it("resets profile and settings storage to defaults", () => {
    saveUserProfile({ ...DEFAULT_USER_PROFILE, name: "Temporary Name" });
    saveUserSettings({
      ...DEFAULT_USER_SETTINGS,
      notifications: { ...DEFAULT_USER_SETTINGS.notifications, enableSound: false },
    });

    const resetProf = resetUserProfileStorage();
    const resetSet = resetUserSettingsStorage();

    expect(resetProf.name).toBe(DEFAULT_USER_PROFILE.name);
    expect(resetSet.notifications.enableSound).toBe(true);
  });
});
