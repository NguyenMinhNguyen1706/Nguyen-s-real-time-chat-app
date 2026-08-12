"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  MessageSquare,
  Palette,
  Shield,
  User,
  UserCheck,
} from "lucide-react";

import { AccountSection } from "@/components/settings/account-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { ChatPreferencesSection } from "@/components/settings/chat-preferences-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { NotificationSection } from "@/components/settings/notification-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { Button } from "@/components/ui/button";

import { useChat, type SettingsCategoryTab } from "@/context/chat-context";

export function SettingsLayout() {
  const { activeSettingsTab, setActiveSettingsTab, setNavTab, setMobileView } = useChat();

  const categories: {
    id: SettingsCategoryTab;
    label: string;
    description: string;
    icon: typeof User;
  }[] = [
    {
      id: "profile",
      label: "My Profile",
      description: "Display name, status, bio & avatar",
      icon: User,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme mode, density & motion",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts, sounds & email digests",
      icon: Bell,
    },
    {
      id: "privacy",
      label: "Privacy",
      description: "Online status, last seen & read receipts",
      icon: Shield,
    },
    {
      id: "chat",
      label: "Chat Preferences",
      description: "Keyboard shortcuts & media autoplay",
      icon: MessageSquare,
    },
    {
      id: "account",
      label: "Account",
      description: "Email, security & session management",
      icon: UserCheck,
    },
    {
      id: "danger",
      label: "Danger Zone",
      description: "Reset local state & storage defaults",
      icon: AlertTriangle,
    },
  ];

  const handleMobileBack = () => {
    setNavTab("chats");
    setMobileView("list");
  };

  const renderActiveSection = () => {
    switch (activeSettingsTab) {
      case "profile":
        return <ProfileSection />;
      case "appearance":
        return <AppearanceSection />;
      case "notifications":
        return <NotificationSection />;
      case "privacy":
        return <PrivacySection />;
      case "chat":
        return <ChatPreferencesSection />;
      case "account":
        return <AccountSection />;
      case "danger":
        return <DangerZoneSection />;
      default:
        return <ProfileSection />;
    }
  };

  const activeCategory = categories.find((c) => c.id === activeSettingsTab) ?? categories[0];

  return (
    <div className="flex h-full w-full flex-col md:flex-row overflow-hidden bg-background">
      {/* Desktop & Tablet Sidebar Category Navigation */}
      <aside
        aria-label="Settings categories"
        className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r bg-muted/20 p-4 space-y-1 overflow-y-auto"
      >
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobileBack}
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">Settings</h2>
            <p className="text-xs text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>

        {/* Mobile Dropdown Category Selector */}
        <div className="block md:hidden pb-2">
          <select
            value={activeSettingsTab}
            onChange={(e) => setActiveSettingsTab(e.target.value as SettingsCategoryTab)}
            className="w-full rounded-lg border border-input bg-background p-2 text-xs font-medium text-foreground outline-none"
            aria-label="Select settings category"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop List Buttons */}
        <nav aria-label="Settings navigation menu" className="hidden md:flex flex-col gap-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeSettingsTab === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveSettingsTab(c.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                aria-label={`Open ${c.label} settings`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${c.id === "danger" ? "text-destructive" : ""}`}
                />
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs truncate">{c.label}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Settings Content Area */}
      <main
        aria-label="Settings category content"
        className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-safe"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Active Category Header */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {activeCategory.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeCategory.description}</p>
          </div>

          {/* Active Section Content */}
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
}
