"use client";

import { CornerDownLeft, Image, Link } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useChat } from "@/context/chat-context";

export function ChatPreferencesSection() {
  const { userPreferences, updateUserPreferences } = useChat();

  const chatOptions = [
    {
      id: "enterToSend",
      label: "Press Enter to Send",
      description: "Send messages when pressing Enter key (Shift+Enter inserts a new line).",
      icon: CornerDownLeft,
      value: userPreferences.chat.enterToSend,
    },
    {
      id: "showLinkPreviews",
      label: "Link Card Previews",
      description: "Automatically render rich open-graph metadata cards for shared links.",
      icon: Link,
      value: userPreferences.chat.showLinkPreviews,
    },
    {
      id: "mediaAutoplay",
      label: "Media Autoplay",
      description: "Automatically play animated GIFs and video previews in chat timeline.",
      icon: Image,
      value: userPreferences.chat.mediaAutoplay,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Chat Preferences
          </h4>
          <p className="text-xs text-muted-foreground">
            Customize composer shortcuts and timeline media rendering.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {chatOptions.map((opt) => {
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
                      htmlFor={`chat-${opt.id}`}
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
                  id={`chat-${opt.id}`}
                  type="checkbox"
                  checked={opt.value}
                  onChange={(e) =>
                    updateUserPreferences("chat", {
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
