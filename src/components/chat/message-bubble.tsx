"use client";

import { useState } from "react";
import { Check, CheckCheck, Clock } from "lucide-react";

import { DeleteConfirmDialog } from "@/components/chat/delete-confirm-dialog";
import { InlineMessageEditor } from "@/components/chat/inline-message-editor";
import { MessageHoverActions } from "@/components/chat/message-hover-actions";
import { MessageReplyPreview } from "@/components/chat/message-reply-preview";
import { ReactionSummary } from "@/components/chat/reaction-summary";
import { useChat } from "@/context/chat-context";
import { formatMessageTime } from "@/lib/format";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
}

export function MessageBubble({ message, isOutgoing }: MessageBubbleProps) {
  const { currentUser, setReplyingToMessage, toggleReaction, editMessage, deleteMessage } =
    useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const currentUserId = currentUser?.id ?? "usr_current";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement("textarea");
      el.value = message.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const handleSaveEdit = async (newContent: string) => {
    await editMessage(message.id, newContent);
    setIsEditing(false);
  };

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
      id={`message-${message.id}`}
      className={`group relative flex flex-col max-w-[85%] sm:max-w-[75%] my-0.5 transition-all rounded-2xl ${
        isOutgoing ? "items-end ml-auto" : "items-start mr-auto"
      }`}
    >
      {!isEditing && (
        <MessageHoverActions
          isOutgoing={isOutgoing}
          onReact={(emoji) => toggleReaction(message.id, emoji)}
          onReply={() => setReplyingToMessage(message)}
          onCopy={handleCopyText}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      )}

      <div
        className={`px-3.5 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-xs"
            : "bg-muted/90 text-foreground border border-border/40 rounded-2xl rounded-tl-xs"
        }`}
      >
        <MessageReplyPreview
          replyToMessageId={message.replyToMessageId}
          replyToMessagePreview={message.replyToMessagePreview}
          isOutgoing={isOutgoing}
        />

        {isEditing ? (
          <InlineMessageEditor
            initialContent={message.content}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <span>{message.content}</span>
        )}

        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
            isOutgoing ? "text-primary-foreground/80" : "text-muted-foreground"
          }`}
        >
          {message.isEdited && <span className="italic opacity-80">(edited)</span>}
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOutgoing && statusIcon()}
        </div>
      </div>

      <ReactionSummary
        reactions={message.reactions}
        currentUserId={currentUserId}
        onToggleReaction={(emoji) => toggleReaction(message.id, emoji)}
        isOutgoing={isOutgoing}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={() => deleteMessage(message.id)}
      />
    </div>
  );
}
