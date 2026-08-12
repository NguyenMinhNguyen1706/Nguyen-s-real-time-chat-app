import type { ConversationPreview, Message } from "@/types/chat";
import type { SearchResultItem } from "@/types/search";

export function splitTextByMatches(
  text: string,
  query: string,
): { text: string; isMatch: boolean }[] {
  if (!query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === query.trim().toLowerCase(),
    }));
}

export function searchAll(
  query: string,
  conversations: ConversationPreview[],
  messagesMap: Record<string, Message[]>,
  scopeConversationId?: string,
): SearchResultItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: SearchResultItem[] = [];

  // Filter conversations if not scoped to a single conversation
  if (!scopeConversationId) {
    for (const conv of conversations) {
      let score = 0;
      const titleLower = conv.title.toLowerCase();

      if (titleLower === trimmed) {
        score += 100;
      } else if (titleLower.startsWith(trimmed)) {
        score += 80;
      } else if (titleLower.includes(trimmed)) {
        score += 60;
      }

      // Check participants
      for (const p of conv.participants) {
        const pName = p.name.toLowerCase();
        if (pName.includes(trimmed)) {
          score += 40;
        }
      }

      if (score > 0) {
        results.push({
          id: `conv_${conv.id}`,
          type: "conversation",
          conversationId: conv.id,
          title: conv.title,
          subtitle: conv.type === "group" ? `${conv.participants.length} members` : "Direct Chat",
          content: conv.lastMessage?.content ?? "No recent messages",
          timestamp: conv.updatedAt,
          avatarUrl: conv.avatarUrl,
          matchScore: score,
        });
      }
    }
  }

  // Search messages
  const targetConvIds = scopeConversationId ? [scopeConversationId] : Object.keys(messagesMap);

  for (const convId of targetConvIds) {
    const msgs = messagesMap[convId] ?? [];
    const conv = conversations.find((c) => c.id === convId);

    for (const msg of msgs) {
      const contentLower = msg.content.toLowerCase();
      const senderLower = msg.senderName.toLowerCase();

      let score = 0;
      if (contentLower.includes(trimmed)) {
        score += 50;
      }
      if (senderLower.includes(trimmed)) {
        score += 30;
      }

      if (score > 0) {
        results.push({
          id: `msg_${msg.id}`,
          type: "message",
          conversationId: convId,
          messageId: msg.id,
          title: msg.senderName,
          subtitle: conv?.title ?? "Chat",
          content: msg.content,
          timestamp: msg.timestamp,
          avatarUrl: msg.senderAvatarUrl ?? conv?.avatarUrl,
          matchScore: score,
        });
      }
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
