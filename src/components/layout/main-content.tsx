"use client";

import {
  ArrowLeft,
  Info,
  Lock,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat } from "@/context/chat-context";
import { formatRelativeTime } from "@/lib/format";

export function MainContent() {
  const { selectedConversation, clearSelectedConversation } = useChat();

  if (!selectedConversation) {
    return <EmptyWorkspaceState />;
  }

  return (
    <main
      aria-label="Chat workspace"
      className="flex h-full flex-1 flex-col overflow-hidden bg-background"
    >
      {/* Active Conversation Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            aria-label="Back to conversations"
            onClick={clearSelectedConversation}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8 border border-border/50">
            {selectedConversation.avatarUrl && (
              <AvatarImage src={selectedConversation.avatarUrl} alt={selectedConversation.title} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {selectedConversation.type === "group" ? (
                <Users className="h-4 w-4" />
              ) : (
                selectedConversation.title.slice(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground leading-none">
                {selectedConversation.title}
              </h3>
              {selectedConversation.isFavorite && (
                <Badge variant="outline" className="text-[10px] h-4 px-1">
                  Favorite
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {selectedConversation.type === "group"
                ? `${selectedConversation.participants.length} members`
                : selectedConversation.isOnline
                ? "Active now"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Audio call">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Audio Call (coming soon)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Video call">
                <Video className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video Call (coming soon)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Details">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Conversation details</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main Workspace Body Placeholder */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center my-auto space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>

          <div>
            <h4 className="text-base font-semibold text-foreground">
              Conversation shell ready for {selectedConversation.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              This space will host real-time message streams, reaction pickers, and interactive message composers in upcoming TASK 04.
            </p>
          </div>

          {selectedConversation.lastMessage && (
            <div className="w-full max-w-md rounded-xl border bg-muted/30 p-4 text-left shadow-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">Latest Message Preview</span>
                <span>{formatRelativeTime(selectedConversation.lastMessage.timestamp)}</span>
              </div>
              <p className="text-xs text-foreground/90 italic">
                &quot;{selectedConversation.lastMessage.content}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
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
            Select a conversation from the sidebar to view active message streams or search for contacts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 text-left">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-2xs">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="text-xs font-semibold text-foreground">Secure Repository Architecture</p>
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
