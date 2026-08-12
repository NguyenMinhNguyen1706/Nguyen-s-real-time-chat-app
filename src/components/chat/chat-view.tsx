"use client";

import { ChatHeader } from "@/components/chat/chat-header";
import { ComposerPlaceholder } from "@/components/chat/composer-placeholder";
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
      <ComposerPlaceholder />
    </div>
  );
}
