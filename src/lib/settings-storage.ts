import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_SETTINGS,
  type UserProfile,
  type UserSettings,
} from "@/types/settings";

const PROFILE_KEY = "nguyens_chat_profile_v1";
const SETTINGS_KEY = "nguyens_chat_settings_v1";

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return DEFAULT_USER_PROFILE;
  }
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Graceful storage quota / disabled fallback
  }
}

export function loadUserSettings(): UserSettings {
  if (typeof window === "undefined") {
    return DEFAULT_USER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      appearance: { ...DEFAULT_USER_SETTINGS.appearance, ...parsed.appearance },
      notifications: { ...DEFAULT_USER_SETTINGS.notifications, ...parsed.notifications },
      privacy: { ...DEFAULT_USER_SETTINGS.privacy, ...parsed.privacy },
      chat: { ...DEFAULT_USER_SETTINGS.chat, ...parsed.chat },
    };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Graceful storage fallback
  }
}

export function resetUserProfileStorage(): UserProfile {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_USER_PROFILE;
}

export function resetUserSettingsStorage(): UserSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_USER_SETTINGS;
}
