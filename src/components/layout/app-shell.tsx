"use client";

import { PanelLeft } from "lucide-react";

import { ConversationColumn } from "@/components/layout/conversation-column";
import { MainContent } from "@/components/layout/main-content";
import { NavRail } from "@/components/layout/nav-rail";
import { SearchModal } from "@/components/search/search-modal";
import { Button } from "@/components/ui/button";
import { ChatProvider, useChat } from "@/context/chat-context";

function AppShellContent() {
  const { userPreferences, mobileView, mobileSidebarOpen, setMobileSidebarOpen } = useChat();

  const isReducedMotion = userPreferences.appearance.reducedMotion;
  const isCompact = userPreferences.appearance.density === "compact";

  return (
    <div
      className={`flex h-dvh w-full overflow-hidden bg-background ${
        isReducedMotion ? "reduced-motion" : ""
      } ${isCompact ? "density-compact" : ""}`}
    >
      {/* Search Modal Overlay */}
      <SearchModal />

      {/* Desktop 3-Region Layout */}
      <div className="hidden md:flex h-full w-full overflow-hidden">
        <NavRail />
        <ConversationColumn />
        <MainContent />
      </div>

      {/* Mobile Responsive Layout */}
      <div className="flex md:hidden h-full w-full flex-col overflow-hidden">
        {mobileView === "list" ? (
          <div className="flex h-full w-full flex-col overflow-hidden">
            <header className="flex h-12 shrink-0 items-center border-b px-3 bg-background pt-safe">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Open navigation menu"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
              <span className="ml-2 text-sm font-semibold tracking-tight">Realtime Chat</span>
            </header>
            <div className="flex-1 overflow-hidden">
              <ConversationColumn />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col overflow-hidden">
            <MainContent />
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-label="Close navigation overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-16 bg-sidebar shadow-xl">
            <NavRail />
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell() {
  return (
    <ChatProvider>
      <AppShellContent />
    </ChatProvider>
  );
}
