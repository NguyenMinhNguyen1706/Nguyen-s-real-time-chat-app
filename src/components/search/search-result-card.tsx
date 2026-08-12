import { MessageSquare, Users } from "lucide-react";

import { HighlightText } from "@/components/search/highlight-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatMessageTime } from "@/lib/format";
import type { SearchResultItem } from "@/types/search";

interface SearchResultCardProps {
  item: SearchResultItem;
  query: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export function SearchResultCard({ item, query, isSelected, onSelect }: SearchResultCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-start gap-3 rounded-lg p-3 transition-colors ${
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"
      }`}
      aria-label={`Search result: ${item.title}`}
    >
      <Avatar className="h-9 w-9 shrink-0 mt-0.5 border border-border/50">
        {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt={item.title} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {item.type === "conversation" ? (
            <Users className="h-4 w-4" />
          ) : (
            item.title.slice(0, 2).toUpperCase()
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              <HighlightText text={item.title} query={query} />
            </span>
            <Badge variant="outline" className="text-[10px] h-4 px-1 shrink-0">
              {item.type === "message" ? (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-2.5 w-2.5" /> Message
                </span>
              ) : (
                "Chat"
              )}
            </Badge>
          </div>
          {item.timestamp && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatMessageTime(item.timestamp)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {item.subtitle && <span className="font-medium mr-1">{item.subtitle}:</span>}
          <HighlightText text={item.content} query={query} />
        </p>
      </div>
    </button>
  );
}
