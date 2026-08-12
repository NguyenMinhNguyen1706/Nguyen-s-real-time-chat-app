interface ReplyPreviewPlaceholderProps {
  replyMessageId?: string | null;
  onClearReply?: () => void;
}

export function ReplyPreviewPlaceholder({ replyMessageId }: ReplyPreviewPlaceholderProps) {
  if (!replyMessageId) return null;

  return (
    <div className="flex items-center justify-between border-l-2 border-primary bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground mb-2 rounded-r-md">
      <span>Replying to message... (TASK 06)</span>
    </div>
  );
}
