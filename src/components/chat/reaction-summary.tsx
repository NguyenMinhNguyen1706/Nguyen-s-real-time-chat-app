import type { MessageReaction } from "@/types/chat";

interface ReactionSummaryProps {
  reactions?: MessageReaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
  isOutgoing: boolean;
}

export function ReactionSummary({
  reactions = [],
  currentUserId,
  onToggleReaction,
  isOutgoing,
}: ReactionSummaryProps) {
  if (reactions.length === 0) return null;

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, { count: number; reactedByMe: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = { count: 0, reactedByMe: false };
      }
      acc[r.emoji].count += 1;
      if (r.userId === currentUserId) {
        acc[r.emoji].reactedByMe = true;
      }
      return acc;
    },
    {},
  );

  return (
    <div
      className={`flex flex-wrap gap-1 mt-1 ${isOutgoing ? "justify-end" : "justify-start"}`}
      aria-label="Message reactions"
    >
      {Object.entries(grouped).map(([emoji, { count, reactedByMe }]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onToggleReaction(emoji)}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all shadow-2xs border ${
            reactedByMe
              ? "bg-primary/15 border-primary/40 text-primary dark:bg-primary/25"
              : "bg-muted/80 border-border/60 text-muted-foreground hover:bg-muted"
          }`}
          aria-label={`Reaction ${emoji}, ${count} people`}
        >
          <span>{emoji}</span>
          <span className="text-[10px]">{count}</span>
        </button>
      ))}
    </div>
  );
}
