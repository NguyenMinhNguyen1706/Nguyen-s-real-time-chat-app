import { MessageSquarePlus } from "lucide-react";

interface EmptyChatStateProps {
  participantName: string;
}

export function EmptyChatState({ participantName }: EmptyChatStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
        <MessageSquarePlus className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        No messages yet with {participantName}
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Be the first to break the ice! Type your message in the composer below to start the
        conversation.
      </p>
    </div>
  );
}
