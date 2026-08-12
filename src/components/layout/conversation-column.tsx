"use client";

import {
  ArrowUpDown,
  BellOff,
  Check,
  MoreVertical,
  Pin,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
    sortBy,
    setSortBy,
    isLoading,
    togglePinConversation,
    toggleMuteConversation,
  } = useChat();

  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const otherConversations = conversations.filter((c) => !c.isPinned);

  return (
    <aside
      aria-label="Conversation panel"
      className="flex h-full w-80 flex-col border-r bg-background"
    >
      {/* Column Header & Actions */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Conversations</h2>
        <div className="flex items-center gap-1">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground"
                aria-label="Sort conversations"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                <span className="flex-1">Newest First</span>
                {sortBy === "newest" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("unread")}>
                <span className="flex-1">Unread First</span>
                {sortBy === "unread" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <span className="flex-1">By Name</span>
                {sortBy === "name" && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Conversation Action */}
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
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages & contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
            aria-label="Search conversations"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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

      {/* Scrollable Conversation List */}
      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground mt-8">
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? `No matches for "${searchQuery}"`
                : "No conversations in this category tab."}
            </p>
            {searchQuery && (
              <Button
                variant="link"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setSearchQuery("")}
              >
                Clear search filter
              </Button>
            )}
          </div>
        ) : (
          <nav aria-label="Conversation list" className="space-y-3">
            {/* Pinned Section */}
            {categoryFilter === "all" && pinnedConversations.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                </div>
                {pinnedConversations.map((item) => (
                  <ConversationItem
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedConversationId}
                    onSelect={() => setSelectedConversationId(item.id)}
                    onTogglePin={() => togglePinConversation(item.id)}
                    onToggleMute={() => toggleMuteConversation(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Other / Unpinned Conversations */}
            <div className="space-y-1">
              {categoryFilter === "all" && pinnedConversations.length > 0 && (
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  <span>All Messages</span>
                </div>
              )}
              {(categoryFilter === "all" ? otherConversations : conversations).map((item) => (
                <ConversationItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedConversationId}
                  onSelect={() => setSelectedConversationId(item.id)}
                  onTogglePin={() => togglePinConversation(item.id)}
                  onToggleMute={() => toggleMuteConversation(item.id)}
                />
              ))}
            </div>
          </nav>
        )}
      </ScrollArea>
    </aside>
  );
}

function ConversationItem({
  item,
  isSelected,
  onSelect,
  onTogglePin,
  onToggleMute,
}: {
  item: ConversationPreview;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
}) {
  const presenceColor =
    item.presenceStatus === "online"
      ? "bg-success ring-2 ring-background"
      : item.presenceStatus === "away"
        ? "bg-warning ring-2 ring-background"
        : "bg-muted-foreground/40 ring-2 ring-background";

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`group relative flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-all hover:bg-muted/70 focus-within:ring-2 focus-within:ring-ring ${
        isSelected ? "bg-accent text-accent-foreground font-medium shadow-xs" : ""
      }`}
    >
      {/* Click target for selecting conversation */}
      <button
        type="button"
        onClick={onSelect}
        className="absolute inset-0 z-0 rounded-lg outline-hidden"
        aria-label={`Open conversation with ${item.title}`}
      />

      {/* Avatar & Presence */}
      <div className="relative shrink-0 z-10 pointer-events-none">
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
        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${presenceColor}`} />
      </div>

      {/* Main Info */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <span className="truncate text-xs font-semibold text-foreground">{item.title}</span>
            {item.isPinned && <Pin className="h-3 w-3 text-muted-foreground shrink-0 rotate-45" />}
            {item.isMuted && <BellOff className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
          {item.lastMessage && (
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(item.lastMessage.timestamp)}
            </span>
          )}
        </div>

        {item.lastMessage && (
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="truncate text-[11px] text-muted-foreground leading-tight">
              <span className="font-medium text-foreground/80">
                {item.lastMessage.senderName.split(" ")[0]}:{" "}
              </span>
              {item.lastMessage.content}
            </p>
            {item.unreadCount > 0 && (
              <Badge variant="default" className="h-4 px-1.5 text-[10px] font-bold shrink-0">
                {item.unreadCount}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Item Context Menu Trigger */}
      <div className="relative z-20 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md p-0"
              aria-label={`Options for ${item.title}`}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={onTogglePin}>
              <Pin className="h-3.5 w-3.5 mr-2" />
              <span>{item.isPinned ? "Unpin" : "Pin"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleMute}>
              <BellOff className="h-3.5 w-3.5 mr-2" />
              <span>{item.isMuted ? "Unmute" : "Mute"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2.5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
