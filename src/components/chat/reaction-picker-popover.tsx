import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DEFAULT_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

interface ReactionPickerPopoverProps {
  onSelectReaction: (emoji: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReactionPickerPopover({
  onSelectReaction,
  open,
  onOpenChange,
}: ReactionPickerPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Add reaction"
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-auto p-1.5 shadow-md border bg-popover rounded-full"
      >
        <div className="flex items-center gap-1">
          {DEFAULT_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onSelectReaction(emoji);
                onOpenChange(false);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted text-base transition-transform hover:scale-125"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
