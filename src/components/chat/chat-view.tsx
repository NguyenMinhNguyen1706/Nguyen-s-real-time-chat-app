"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageTimeline } from "@/components/chat/message-timeline";
import type { ConversationPreview } from "@/types/chat";

interface ChatViewProps {
  conversation: ConversationPreview;
}

export function ChatView({ conversation }: ChatViewProps) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <ChatHeader conversation={conversation} />
      <MessageTimeline />
      <MessageComposer />
    </div>
  );
}
