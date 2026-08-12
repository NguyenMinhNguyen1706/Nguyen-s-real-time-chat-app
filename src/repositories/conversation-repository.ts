import { MOCK_CONVERSATIONS, MOCK_CURRENT_USER } from "@/repositories/mock/mock-data";
import type { ConversationCategory, ConversationPreview, UserSummary } from "@/types/chat";

export interface IConversationRepository {
  getCurrentUser(): Promise<UserSummary>;
  getConversations(
    category?: ConversationCategory,
    searchQuery?: string,
  ): Promise<ConversationPreview[]>;
  getConversationById(id: string): Promise<ConversationPreview | null>;
}

export class MockConversationRepository implements IConversationRepository {
  async getCurrentUser(): Promise<UserSummary> {
    return MOCK_CURRENT_USER;
  }

  async getConversations(
    category: ConversationCategory = "all",
    searchQuery: string = "",
  ): Promise<ConversationPreview[]> {
    let result = [...MOCK_CONVERSATIONS];

    if (category === "unread") {
      result = result.filter((c) => !c.isArchived && c.unreadCount > 0);
    } else if (category === "favorites") {
      result = result.filter((c) => !c.isArchived && c.isFavorite);
    } else if (category === "archived") {
      result = result.filter((c) => c.isArchived);
    } else {
      result = result.filter((c) => !c.isArchived);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) || c.lastMessage?.content.toLowerCase().includes(q),
      );
    }

    return result;
  }

  async getConversationById(id: string): Promise<ConversationPreview | null> {
    const found = MOCK_CONVERSATIONS.find((c) => c.id === id);
    return found ?? null;
  }
}

export const conversationRepository: IConversationRepository = new MockConversationRepository();
