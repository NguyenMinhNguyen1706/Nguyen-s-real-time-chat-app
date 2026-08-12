"use client";

import { Plus, Search, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat } from "@/context/chat-context";
import { formatRelativeTime } from "@/lib/format";
import type { ConversationCategory, ConversationPreview } from "@/types/chat";

export function ConversationColumn() {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
  } = useChat();

  return (
    <aside
      aria-label="Conversation panel"
      className="flex h-full w-80 flex-col border-r bg-background"
    >
      {/* Column Header & Actions */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Conversations</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              aria-label="New conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New conversation (coming soon)</TooltipContent>
        </Tooltip>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-1">
        <Tabs
          value={categoryFilter}
          onValueChange={(val) => setCategoryFilter(val as ConversationCategory)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted/60">
            <TabsTrigger value="all" className="text-[11px] px-1 py-1">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-[11px] px-1 py-1">
              Unread
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-[11px] px-1 py-1">
              Favorites
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-[11px] px-1 py-1">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2 py-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground mt-8">
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search query or filter tab.
            </p>
          </div>
        ) : (
          <nav aria-label="Conversation items" className="space-y-1">
            {conversations.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                isSelected={item.id === selectedConversationId}
                onSelect={() => setSelectedConversationId(item.id)}
              />
            ))}
          </nav>
        )}
      </ScrollArea>
    </aside>
  );
}

function ConversationRow({
  item,
  isSelected,
  onSelect,
}: {
  item: ConversationPreview;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-all hover:bg-muted/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
        isSelected ? "bg-accent text-accent-foreground font-medium shadow-xs" : ""
      }`}
      aria-label={`Open conversation with ${item.title}`}
    >
      {/* Avatar with status indicator */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border border-border/50">
          {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt={item.title} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {item.type === "group" ? (
              <Users className="h-4 w-4" />
            ) : (
              item.title.slice(0, 2).toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>
        {item.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
        )}
      </div>

      {/* Info & Content Snippet */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-semibold text-foreground">{item.title}</span>
          {item.lastMessage && (
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(item.lastMessage.timestamp)}
            </span>
          )}
        </div>
        {item.lastMessage && (
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="truncate text-[11px] text-muted-foreground leading-tight">
              <span className="font-medium text-foreground/80">{item.lastMessage.senderName.split(" ")[0]}: </span>
              {item.lastMessage.content}
            </p>
            {item.unreadCount > 0 && (
              <Badge variant="default" className="h-4 px-1.5 text-[10px] font-bold">
                {item.unreadCount}
              </Badge>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
