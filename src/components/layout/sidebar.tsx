import { MessagesSquare, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  onNavigate: () => void;
}

const PLACEHOLDER_ROWS = [0, 1, 2, 3, 4];

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-72 flex-col border-r bg-sidebar">
      <div className="flex items-center justify-between p-3">
        <h2 className="px-1 text-sm font-semibold text-sidebar-foreground">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="New conversation (coming soon)"
          title="New conversation — coming soon"
          onClick={onNavigate}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <nav
        aria-label="Conversation list"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2"
      >
        {PLACEHOLDER_ROWS.map((row) => (
          <div key={row} className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarMobile({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Close conversation list"
        onClick={onClose}
      />
      <aside className="relative h-full">
        <Sidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}

export function SidebarEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <MessagesSquare className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">No conversations yet</p>
      <p className="text-xs text-muted-foreground">
        Conversations will appear here once the app is connected to a backend.
      </p>
    </div>
  );
}
