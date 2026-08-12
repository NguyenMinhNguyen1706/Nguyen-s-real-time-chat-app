import { useState } from "react";
import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const EMOJI_CATEGORIES = [
  {
    name: "Frequently Used",
    emojis: ["👍", "❤️", "🔥", "🚀", "😂", "🎉", "🙌", "✨"],
  },
  {
    name: "Smileys & People",
    emojis: ["😀", "😃", "😄", "😁", "😊", "😎", "🤩", "🤔", "🧐", "😅", "😌", "😍"],
  },
  {
    name: "Gestures & Symbols",
    emojis: ["👋", "✌️", "🤞", "👏", "💪", "💡", "✅", "⚠️", "📌", "💬", "⚡️", "🎯"],
  },
];

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPickerPopover({ onSelectEmoji, disabled }: EmojiPickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const handlePick = (emoji: string) => {
    onSelectEmoji(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add emoji</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-64 p-3 shadow-md border bg-popover">
        <div className="space-y-3">
          <div className="text-xs font-semibold text-foreground tracking-tight border-b pb-1">
            Emoji Picker
          </div>
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {category.name}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-base transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={`Select emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
