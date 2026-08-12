import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "@/components/chat/message-bubble";
import type { MessageGroup as MessageGroupType } from "@/types/chat";

interface MessageGroupProps {
  group: MessageGroupType;
}

export function MessageGroup({ group }: MessageGroupProps) {
  const { senderName, senderAvatarUrl, isOutgoing, messages } = group;

  return (
    <div className={`flex gap-2.5 my-2 ${isOutgoing ? "justify-end" : "justify-start"}`}>
      {/* Avatar for incoming group */}
      {!isOutgoing && (
        <Avatar className="h-7 w-7 mt-1 shrink-0 border border-border/40">
          {senderAvatarUrl && <AvatarImage src={senderAvatarUrl} alt={senderName} />}
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
            {senderName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col gap-1.5 w-full ${isOutgoing ? "items-end" : "items-start"}`}>
        {/* Sender Name for incoming group */}
        {!isOutgoing && (
          <span className="text-[11px] font-semibold text-muted-foreground px-1">{senderName}</span>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOutgoing={isOutgoing} />
        ))}
      </div>
    </div>
  );
}
