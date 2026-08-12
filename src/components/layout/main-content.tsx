"use client";

import { Lock, ShieldCheck, Sparkles } from "lucide-react";

import { ChatView } from "@/components/chat/chat-view";
import { SettingsLayout } from "@/components/settings/settings-layout";
import { useChat } from "@/context/chat-context";

export function MainContent() {
  const { navTab, selectedConversation } = useChat();

  if (navTab === "settings") {
    return (
      <main
        aria-label="Settings workspace"
        className="flex h-full flex-1 flex-col overflow-hidden bg-background"
      >
        <SettingsLayout />
      </main>
    );
  }

  if (!selectedConversation) {
    return <EmptyWorkspaceState />;
  }

  return (
    <main
      aria-label="Chat workspace"
      className="flex h-full flex-1 flex-col overflow-hidden bg-background"
    >
      <ChatView conversation={selectedConversation} />
    </main>
  );
}

function EmptyWorkspaceState() {
  return (
    <main
      aria-label="Workspace initial state"
      className="flex h-full flex-1 flex-col items-center justify-center p-6 text-center bg-muted/10"
    >
      <div className="mx-auto max-w-sm space-y-6">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-md">
          <Sparkles className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Realtime Chat</h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Select a conversation from the sidebar to view active message streams or search for
            contacts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 text-left">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-2xs">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Secure Repository Architecture
              </p>
              <p className="text-[11px] text-muted-foreground">
                Prepared for Supabase Realtime & RLS integration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-2xs">
            <Lock className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Clean State Plumbing</p>
              <p className="text-[11px] text-muted-foreground">
                Responsive mobile navigation & desktop layout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
