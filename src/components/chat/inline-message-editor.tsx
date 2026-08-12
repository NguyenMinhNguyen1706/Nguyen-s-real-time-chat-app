import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface InlineMessageEditorProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export function InlineMessageEditor({
  initialContent,
  onSave,
  onCancel,
}: InlineMessageEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [content.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-[220px]">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Edit message input"
        className="w-full resize-none rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-1.5 text-xs sm:text-sm text-primary-foreground placeholder:text-primary-foreground/60 outline-none focus:ring-1 focus:ring-primary-foreground"
        rows={2}
      />
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 px-2 text-[11px] text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!content.trim()}
          onClick={handleSave}
          className="h-6 px-2 text-[11px] bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
