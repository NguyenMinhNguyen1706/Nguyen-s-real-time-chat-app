"use client";

import { useEffect, useRef } from "react";

import { DateSeparator } from "@/components/chat/date-separator";
import { EmptyChatState } from "@/components/chat/empty-chat-state";
import { MessageGroup } from "@/components/chat/message-group";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { UnreadSeparator } from "@/components/chat/unread-separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/context/chat-context";
import { groupConsecutiveMessages, partitionMessagesByDate } from "@/lib/message-grouping";

export function MessageTimeline() {
  const { selectedConversation, currentUser, messages, typingUsers, isMessagesLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id ?? "usr_current";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedConversation?.id]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
          </div>
        </div>
        <div className="flex items-end justify-end gap-3">
          <Skeleton className="h-10 w-1/2 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <EmptyChatState participantName={selectedConversation?.title ?? "participant"} />
      </div>
    );
  }

  const datePartitions = partitionMessagesByDate(messages);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Message timeline"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth"
    >
      {datePartitions.map((partition) => {
        const groups = groupConsecutiveMessages(partition.messages, currentUserId);

        return (
          <div key={partition.dateKey} className="space-y-3">
            <DateSeparator label={partition.dateLabel} />

            {groups.map((group) => {
              const hasUnread = group.messages.some((m) => m.isUnread);

              return (
                <div key={group.id}>
                  {hasUnread && <UnreadSeparator />}
                  <MessageGroup group={group} />
                </div>
              );
            })}
          </div>
        );
      })}

      <TypingIndicator users={typingUsers} />
    </div>
  );
}
