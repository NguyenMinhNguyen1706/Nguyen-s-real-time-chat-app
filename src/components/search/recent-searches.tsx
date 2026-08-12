import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RecentSearchesProps {
  recentQueries: string[];
  onSelectQuery: (query: string) => void;
  onRemoveQuery: (query: string) => void;
  onClearAll: () => void;
}

export function RecentSearches({
  recentQueries,
  onSelectQuery,
  onRemoveQuery,
  onClearAll,
}: RecentSearchesProps) {
  if (recentQueries.length === 0) return null;

  return (
    <div className="space-y-2 px-2 py-2 border-b">
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Recent Searches
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] hover:text-foreground text-muted-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {recentQueries.map((q) => (
          <div
            key={q}
            role="group"
            aria-label={`Recent search ${q}`}
            className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs text-foreground transition-all hover:bg-muted"
          >
            <button
              type="button"
              onClick={() => onSelectQuery(q)}
              className="text-xs font-medium outline-none"
            >
              {q}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveQuery(q)}
              className="h-4 w-4 rounded-full p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Remove recent search ${q}`}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
