"use client";

import { CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useChat } from "@/context/chat-context";

export function PrivacySection() {
  const { userPreferences, updateUserPreferences } = useChat();

  const privacyOptions = [
    {
      id: "showOnlineStatus",
      label: "Show Online Presence",
      description: "Allow contacts to see when you are currently online or active.",
      icon: Shield,
      value: userPreferences.privacy.showOnlineStatus,
    },
    {
      id: "showLastSeen",
      label: "Show Last Seen Timestamp",
      description: "Display your last active timestamp in direct chats.",
      icon: Eye,
      value: userPreferences.privacy.showLastSeen,
    },
    {
      id: "readReceipts",
      label: "Send Read Receipts",
      description: "Show checkmarks when you have opened and read incoming messages.",
      icon: CheckCircle2,
      value: userPreferences.privacy.readReceipts,
    },
    {
      id: "allowTypingIndicator",
      label: "Broadcast Typing Indicator",
      description: "Inform participants when you are typing a message reply.",
      icon: EyeOff,
      value: userPreferences.privacy.allowTypingIndicator,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Privacy Preferences
          </h4>
          <p className="text-xs text-muted-foreground">
            Control your visibility and communication preferences across the application.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {privacyOptions.map((opt) => {
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
                      htmlFor={`priv-${opt.id}`}
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
                  id={`priv-${opt.id}`}
                  type="checkbox"
                  checked={opt.value}
                  onChange={(e) =>
                    updateUserPreferences("privacy", {
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
