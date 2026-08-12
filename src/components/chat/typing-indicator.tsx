interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const text =
    users.length === 1 ? `${users[0]} is typing...` : `${users.join(", ")} are typing...`;

  return (
    <div
      aria-label={text}
      className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground animate-pulse"
    >
      <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-ping" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-ping delay-150" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-ping delay-300" />
      </div>
      <span className="font-medium text-[11px]">{text}</span>
    </div>
  );
}
