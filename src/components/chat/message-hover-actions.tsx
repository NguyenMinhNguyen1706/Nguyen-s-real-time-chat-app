import { useState } from "react";
import { Copy, MoreHorizontal, Reply, Trash2, Edit3, Check } from "lucide-react";

import { ReactionPickerPopover } from "@/components/chat/reaction-picker-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageHoverActionsProps {
  isOutgoing: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageHoverActions({
  isOutgoing,
  onReact,
  onReply,
  onCopy,
  onEdit,
  onDelete,
}: MessageHoverActionsProps) {
  const [reactionOpen, setReactionOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="region"
      aria-label="Message action toolbar"
      className={`absolute top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex items-center gap-0.5 rounded-full border bg-background/95 p-0.5 shadow-xs backdrop-blur-xs transition-opacity ${
        isOutgoing ? "-left-28" : "-right-28"
      }`}
    >
      <ReactionPickerPopover
        open={reactionOpen}
        onOpenChange={setReactionOpen}
        onSelectReaction={onReact}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReply}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Reply to message"
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reply</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyText}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Copy message text"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>

      {isOutgoing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="More message options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOutgoing ? "end" : "start"} className="w-36">
            <DropdownMenuItem onClick={onEdit} className="text-xs gap-2">
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-xs gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
