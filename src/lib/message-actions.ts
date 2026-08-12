import type { Message } from "@/types/chat";

export type MessageActionType = "react" | "reply" | "copy" | "edit" | "delete";

export interface MessageActionItem {
  type: MessageActionType;
  label: string;
  isDangerous?: boolean;
}

export function getAvailableMessageActions(
  _message: Message,
  isOutgoing: boolean,
): MessageActionItem[] {
  const commonActions: MessageActionItem[] = [
    { type: "react", label: "Add reaction" },
    { type: "reply", label: "Reply" },
    { type: "copy", label: "Copy text" },
  ];

  if (!isOutgoing) {
    return commonActions;
  }

  return [
    ...commonActions,
    { type: "edit", label: "Edit message" },
    { type: "delete", label: "Delete message", isDangerous: true },
  ];
}
