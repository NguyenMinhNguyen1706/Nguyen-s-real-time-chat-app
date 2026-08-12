import { FileText, Image as ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AttachmentPreview } from "@/types/chat";

interface AttachmentChipProps {
  attachment: AttachmentPreview;
  onRemove: () => void;
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = attachment.type.startsWith("image/");

  return (
    <div
      role="group"
      aria-label={`Attached file ${attachment.name}`}
      className="inline-flex items-center gap-2 rounded-lg border bg-muted/60 px-2.5 py-1 text-xs shadow-2xs transition-all"
    >
      {isImage ? (
        <ImageIcon className="h-4 w-4 text-primary shrink-0" />
      ) : (
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      )}

      <div className="flex flex-col max-w-[180px] sm:max-w-[240px] truncate">
        <span className="font-semibold text-foreground truncate">{attachment.name}</span>
        <span className="text-[10px] text-muted-foreground">{formatSize(attachment.size)}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
        aria-label="Remove attachment"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
