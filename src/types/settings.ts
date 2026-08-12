export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  presenceStatus: PresenceStatus;
  statusMessage: string;
  bio: string;
  role: string;
  joinedDate: string;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  reducedMotion: boolean;
}

export interface NotificationSettings {
  enableSound: boolean;
  desktopAlerts: boolean;
  emailAlerts: boolean;
  mentionOnly: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  readReceipts: boolean;
  allowTypingIndicator: boolean;
}

export interface ChatSettings {
  enterToSend: boolean;
  showLinkPreviews: boolean;
  mediaAutoplay: boolean;
}

export interface UserSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  chat: ChatSettings;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "usr_current",
  name: "Nguyen Minh",
  username: "nguyen.minh",
  email: "nguyen.minh@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  presenceStatus: "online",
  statusMessage: "Building real-time chat app",
  bio: "Lead Software Architect & Senior Full-Stack Engineer passionate about high-performance web applications and sleek UI.",
  role: "Lead Architect",
  joinedDate: "January 2026",
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  appearance: {
    theme: "system",
    density: "comfortable",
    reducedMotion: false,
  },
  notifications: {
    enableSound: true,
    desktopAlerts: true,
    emailAlerts: false,
    mentionOnly: false,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    readReceipts: true,
    allowTypingIndicator: true,
  },
  chat: {
    enterToSend: true,
    showLinkPreviews: true,
    mediaAutoplay: true,
  },
};
