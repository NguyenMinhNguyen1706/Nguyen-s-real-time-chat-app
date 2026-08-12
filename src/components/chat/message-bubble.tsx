import { Check, CheckCheck, Clock } from "lucide-react";

import { formatMessageTime } from "@/lib/format";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
}

export function MessageBubble({ message, isOutgoing }: MessageBubbleProps) {
  const statusIcon = () => {
    if (!isOutgoing) return null;
    switch (message.status) {
      case "sent":
        return <Check className="h-3 w-3 text-primary-foreground/70" aria-label="Sent" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-primary-foreground/70" aria-label="Delivered" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-sky-200 font-bold" aria-label="Read" />;
      default:
        return <Clock className="h-3 w-3 text-primary-foreground/50" aria-label="Sending" />;
    }
  };

  return (
    <div
      className={`group relative flex flex-col max-w-[85%] sm:max-w-[75%] ${
        isOutgoing ? "items-end ml-auto" : "items-start mr-auto"
      }`}
    >
      <div
        className={`px-3.5 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-xs"
            : "bg-muted/90 text-foreground border border-border/40 rounded-2xl rounded-tl-xs"
        }`}
      >
        {message.content}

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isOutgoing ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOutgoing && statusIcon()}
        </div>
      </div>
    </div>
  );
}
