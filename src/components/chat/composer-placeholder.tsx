import { Paperclip, Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ComposerPlaceholder() {
  return (
    <footer
      aria-label="Message composer placeholder"
      className="border-t p-3 bg-background/95 backdrop-blur-xs"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Attach file (coming in TASK 05)"
              disabled
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file (TASK 05)</TooltipContent>
        </Tooltip>

        <div className="relative flex-1">
          <Input
            disabled
            placeholder="Type a message... (Composer coming in TASK 05)"
            className="h-10 pr-9 text-xs sm:text-sm bg-muted/30"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Add emoji (coming in TASK 05)"
                disabled
              >
                <Smile className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Emoji (TASK 05)</TooltipContent>
          </Tooltip>
        </div>

        <Button
          size="icon"
          disabled
          className="h-10 w-10 shrink-0 bg-primary text-primary-foreground shadow-xs"
          aria-label="Send message (coming in TASK 05)"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
}
