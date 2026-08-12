"use client";

import { Bell, Mail, MessageSquare, Volume2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useChat } from "@/context/chat-context";

export function NotificationSection() {
  const { userPreferences, updateUserPreferences } = useChat();

  const options = [
    {
      id: "desktopAlerts",
      label: "Desktop Notifications",
      description: "Receive push alerts for new incoming messages.",
      icon: Bell,
      value: userPreferences.notifications.desktopAlerts,
    },
    {
      id: "enableSound",
      label: "Sound Effects",
      description: "Play subtle audio cues when messages arrive.",
      icon: Volume2,
      value: userPreferences.notifications.enableSound,
    },
    {
      id: "mentionOnly",
      label: "Mentions Only",
      description: "Only notify when your username or group is tagged.",
      icon: MessageSquare,
      value: userPreferences.notifications.mentionOnly,
    },
    {
      id: "emailAlerts",
      label: "Email Digests",
      description: "Receive offline email summaries for missed conversations.",
      icon: Mail,
      value: userPreferences.notifications.emailAlerts,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notification Preferences
          </h4>
          <p className="text-xs text-muted-foreground">
            Configure how and when you want to be notified about messages.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/60 text-muted-foreground shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <Label
                      htmlFor={`notif-${opt.id}`}
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      {opt.label}
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <input
                  id={`notif-${opt.id}`}
                  type="checkbox"
                  checked={opt.value}
                  onChange={(e) =>
                    updateUserPreferences("notifications", {
                      [opt.id]: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded-xs border-primary text-primary focus:ring-primary cursor-pointer shrink-0"
                  aria-label={`Toggle ${opt.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
