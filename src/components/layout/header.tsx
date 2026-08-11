import { MessageSquare, PanelLeft, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open conversation list"
          onClick={onOpenSidebar}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Realtime Chat</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Account (available after Phase 3)"
          title="Sign in — coming soon"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-muted text-muted-foreground">
              <UserRound className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}
