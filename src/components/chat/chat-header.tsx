import { ArrowLeft, Info, Phone, Search, Users, Video } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat } from "@/context/chat-context";
import type { ConversationPreview } from "@/types/chat";

interface ChatHeaderProps {
  conversation: ConversationPreview;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { clearSelectedConversation } = useChat();

  const getStatusText = () => {
    if (conversation.type === "group") {
      return `${conversation.participants.length} members`;
    }
    switch (conversation.presenceStatus) {
      case "online":
        return "Active now";
      case "away":
        return "Away";
      case "offline":
      default:
        return "Offline";
    }
  };

  const getStatusDotColor = () => {
    switch (conversation.presenceStatus) {
      case "online":
        return "bg-emerald-500";
      case "away":
        return "bg-amber-500";
      case "offline":
      default:
        return "bg-muted-foreground/40";
    }
  };

  return (
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

        <div className="relative">
          <Avatar className="h-9 w-9 border border-border/50">
            {conversation.avatarUrl && (
              <AvatarImage src={conversation.avatarUrl} alt={conversation.title} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {conversation.type === "group" ? (
                <Users className="h-4 w-4" />
              ) : (
                conversation.title.slice(0, 2).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          {conversation.type === "direct" && (
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background ${getStatusDotColor()}`}
              aria-label={`Presence: ${conversation.presenceStatus ?? "offline"}`}
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-none">
              {conversation.title}
            </h3>
            {conversation.isFavorite && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                Favorite
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{getStatusText()}</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Search in conversation"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search in chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Audio call"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Audio Call (coming soon)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Video Call (coming soon)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Details"
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Conversation details</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
