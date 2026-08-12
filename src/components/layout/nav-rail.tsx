"use client";

import { Archive, MessageSquare, MessagesSquare, Settings, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useChat, type NavTab } from "@/context/chat-context";

export function NavRail() {
  const { currentUser, navTab, setNavTab } = useChat();

  const navItems: { id: NavTab; label: string; icon: typeof MessagesSquare }[] = [
    { id: "chats", label: "Chats", icon: MessagesSquare },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "archived", label: "Archived", icon: Archive },
    { id: "settings", label: "Settings", icon: Settings },
  ];

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
        {currentUser && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-9 w-9 border border-border">
                  {currentUser.avatarUrl && (
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  )}
                  <AvatarFallback>{currentUser.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.statusMessage}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
