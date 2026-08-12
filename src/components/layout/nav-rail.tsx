"use client";

import { Archive, MessageSquare, MessagesSquare, Settings, Star } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat, type NavTab } from "@/context/chat-context";

export function NavRail() {
  const { userProfile, navTab, setNavTab, setActiveSettingsTab } = useChat();

  const navItems: { id: NavTab; label: string; icon: typeof MessagesSquare }[] = [
    { id: "chats", label: "Chats", icon: MessagesSquare },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "archived", label: "Archived", icon: Archive },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleAvatarClick = () => {
    setNavTab("settings");
    setActiveSettingsTab("profile");
  };

  const presenceColor =
    userProfile.presenceStatus === "online"
      ? "bg-emerald-500"
      : userProfile.presenceStatus === "away"
        ? "bg-amber-500"
        : userProfile.presenceStatus === "busy"
          ? "bg-rose-500"
          : "bg-slate-400";

  return (
    <aside
      aria-label="Application navigation"
      className="flex h-full w-16 flex-col items-center justify-between border-r bg-sidebar py-3"
    >
      {/* Brand Logo & Main Nav */}
      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <MessageSquare className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Realtime Chat</TooltipContent>
        </Tooltip>

        <nav aria-label="Main menu" className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = navTab === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-10 w-10 rounded-lg ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                    aria-label={item.label}
                    onClick={() => setNavTab(item.id)}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls: Theme Toggle & User Avatar */}
      <div className="flex flex-col items-center gap-3">
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open user profile settings"
            >
              <Avatar className="h-9 w-9 border border-border">
                {userProfile.avatarUrl && (
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                )}
                <AvatarFallback>{userProfile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${presenceColor} ring-2 ring-background`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-semibold">{userProfile.name}</p>
            <p className="text-xs text-muted-foreground">{userProfile.statusMessage}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
