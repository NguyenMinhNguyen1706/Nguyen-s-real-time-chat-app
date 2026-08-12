import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Message } from "@/types/chat";

interface ReplyPreviewProps {
  message: Message | null;
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  if (!message) return null;

  return (
    <div
      role="group"
      aria-label={`Replying to message from ${message.senderName}`}
      className="flex items-center justify-between border-l-3 border-primary bg-muted/60 px-3 py-1.5 text-xs text-foreground rounded-r-lg mb-1 shadow-2xs"
    >
      <div className="flex flex-col max-w-[calc(100%-32px)]">
        <span className="font-semibold text-primary text-[11px] truncate">
          Replying to {message.senderName}
        </span>
        <span className="text-muted-foreground truncate text-[11px]">{message.content}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancel}
        className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Cancel reply"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
