import { formatDateSeparator } from "@/lib/format";
import type { Message, MessageGroup } from "@/types/chat";

export interface DatePartition {
  dateKey: string;
  dateLabel: string;
  messages: Message[];
}

export function partitionMessagesByDate(messages: Message[]): DatePartition[] {
  const partitions: DatePartition[] = [];
  const partitionMap = new Map<string, Message[]>();

  for (const message of messages) {
    const date = new Date(message.timestamp);
    const dateKey = Number.isNaN(date.getTime())
      ? "unknown"
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    if (!partitionMap.has(dateKey)) {
      partitionMap.set(dateKey, []);
    }
    partitionMap.get(dateKey)!.push(message);
  }

  for (const [dateKey, msgs] of partitionMap.entries()) {
    const label = msgs.length > 0 ? formatDateSeparator(msgs[0].timestamp) : dateKey;
    partitions.push({
      dateKey,
      dateLabel: label,
      messages: msgs,
    });
  }

  return partitions;
}

export function groupConsecutiveMessages(
  messages: Message[],
  currentUserId: string,
  maxIntervalMs = 5 * 60 * 1000,
): MessageGroup[] {
  const groups: MessageGroup[] = [];
  if (messages.length === 0) return groups;

  let currentGroup: MessageGroup | null = null;

  for (const message of messages) {
    const isOutgoing = message.senderId === currentUserId;
    const msgTime = new Date(message.timestamp).getTime();

    if (!currentGroup) {
      currentGroup = {
        id: `group_${message.id}`,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatarUrl: message.senderAvatarUrl,
        isOutgoing,
        messages: [message],
      };
      continue;
    }

    const lastMsg = currentGroup.messages[currentGroup.messages.length - 1];
    const lastMsgTime = new Date(lastMsg.timestamp).getTime();
    const isSameSender = currentGroup.senderId === message.senderId;
    const isWithinInterval = msgTime - lastMsgTime <= maxIntervalMs;

    if (isSameSender && isWithinInterval) {
      currentGroup.messages.push(message);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        id: `group_${message.id}`,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatarUrl: message.senderAvatarUrl,
        isOutgoing,
        messages: [message],
      };
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}
