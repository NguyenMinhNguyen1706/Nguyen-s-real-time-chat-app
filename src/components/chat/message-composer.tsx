"use client";

import { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { AttachmentChip } from "@/components/chat/attachment-chip";
import { ComposerTextarea } from "@/components/chat/composer-textarea";
import { EmojiPickerPopover } from "@/components/chat/emoji-picker-popover";
import { ReplyPreviewPlaceholder } from "@/components/chat/reply-preview-placeholder";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChat } from "@/context/chat-context";
import type { AttachmentPreview } from "@/types/chat";

export function MessageComposer() {
  const { sendMessage, selectedConversation } = useChat();
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<AttachmentPreview | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = (content.trim().length > 0 || attachment !== undefined) && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);

    try {
      await sendMessage(content, attachment);
      setContent("");
      setAttachment(undefined);
    } finally {
      setIsSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 10MB.");
      return;
    }

    setAttachment({
      id: `att_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + emoji);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const updated = content.slice(0, start) + emoji + content.slice(end);

    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + emoji.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  if (!selectedConversation) return null;

  return (
    <footer
      aria-label="Message composer"
      className="border-t p-3 bg-background/95 backdrop-blur-xs flex flex-col gap-2"
    >
      <ReplyPreviewPlaceholder />

      {attachment && (
        <div className="px-1 pt-1">
          <AttachmentChip attachment={attachment} onRemove={() => setAttachment(undefined)} />
        </div>
      )}

      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload file attachment"
        />

        {/* Attachment Trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file (max 10MB)</TooltipContent>
        </Tooltip>

        {/* Auto-growing Textarea Input */}
        <div className="relative flex-1">
          <ComposerTextarea
            ref={textareaRef}
            value={content}
            onChange={setContent}
            onSend={handleSend}
            placeholder={`Write a message to ${selectedConversation.title}...`}
            disabled={isSending}
          />
        </div>

        {/* Emoji Picker Popover */}
        <EmojiPickerPopover onSelectEmoji={handleInsertEmoji} disabled={isSending} />

        {/* Send Button */}
        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={handleSend}
          className="h-9 w-9 shrink-0 bg-primary text-primary-foreground shadow-xs mb-0.5 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
}
