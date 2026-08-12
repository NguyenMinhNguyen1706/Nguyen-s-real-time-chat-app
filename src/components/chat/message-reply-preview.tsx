interface MessageReplyPreviewProps {
  replyToMessageId?: string;
  replyToMessagePreview?: {
    senderName: string;
    content: string;
  };
  isOutgoing: boolean;
}

export function MessageReplyPreview({
  replyToMessageId,
  replyToMessagePreview,
  isOutgoing,
}: MessageReplyPreviewProps) {
  if (!replyToMessagePreview) return null;

  const handleScrollToOriginal = () => {
    if (!replyToMessageId) return;
    const targetEl = document.getElementById(`message-${replyToMessageId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      targetEl.classList.add("ring-2", "ring-primary", "transition-all", "duration-500");
      setTimeout(() => {
        targetEl.classList.remove("ring-2", "ring-primary");
      }, 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleScrollToOriginal}
      className={`block w-full text-left mb-1.5 rounded-lg border-l-2 p-2 text-xs transition-opacity hover:opacity-90 ${
        isOutgoing
          ? "border-primary-foreground/80 bg-primary-foreground/15 text-primary-foreground"
          : "border-primary bg-muted/70 text-foreground"
      }`}
      aria-label={`Scroll to original message from ${replyToMessagePreview.senderName}`}
    >
      <div className="font-semibold text-[11px] opacity-90 truncate">
        {replyToMessagePreview.senderName}
      </div>
      <div className="truncate text-[11px] opacity-75">{replyToMessagePreview.content}</div>
    </button>
  );
}
