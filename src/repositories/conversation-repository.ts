import { MOCK_CONVERSATIONS, MOCK_CURRENT_USER } from "@/repositories/mock/mock-data";
import { SupabaseConversationRepository } from "@/repositories/supabase-conversation-repository";
import type {
  ConversationCategory,
  ConversationPreview,
  ConversationSortOption,
  UserSummary,
} from "@/types/chat";

export interface IConversationRepository {
  getCurrentUser(): Promise<UserSummary>;
  getConversations(
    category?: ConversationCategory,
    searchQuery?: string,
    sortBy?: ConversationSortOption,
  ): Promise<ConversationPreview[]>;
  getConversationById(id: string): Promise<ConversationPreview | null>;
  togglePinConversation(id: string): Promise<ConversationPreview | null>;
  toggleMuteConversation(id: string): Promise<ConversationPreview | null>;
}

export class MockConversationRepository implements IConversationRepository {
  private data: ConversationPreview[] = [...MOCK_CONVERSATIONS];

  async getCurrentUser(): Promise<UserSummary> {
    return MOCK_CURRENT_USER;
  }

  async getConversations(
    category: ConversationCategory = "all",
    searchQuery: string = "",
    sortBy: ConversationSortOption = "newest",
  ): Promise<ConversationPreview[]> {
    let result = [...this.data];

    if (category === "unread") {
      result = result.filter((c) => !c.isArchived && c.unreadCount > 0);
    } else if (category === "favorites") {
      result = result.filter((c) => !c.isArchived && (c.isFavorite || c.isPinned));
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

    // Sort logic
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned && sortBy !== "name") {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === "unread") {
        return b.unreadCount - a.unreadCount;
      }
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }

  async getConversationById(id: string): Promise<ConversationPreview | null> {
    const found = this.data.find((c) => c.id === id);
    return found ?? null;
  }

  async togglePinConversation(id: string): Promise<ConversationPreview | null> {
    const target = this.data.find((c) => c.id === id);
    if (!target) return null;
    target.isPinned = !target.isPinned;
    target.isFavorite = target.isPinned;
    return { ...target };
  }

  async toggleMuteConversation(id: string): Promise<ConversationPreview | null> {
    const target = this.data.find((c) => c.id === id);
    if (!target) return null;
    target.isMuted = !target.isMuted;
    return { ...target };
  }
}

// Export singleton instance: use Supabase repository when NEXT_PUBLIC_SUPABASE_URL is configured, else Mock
export const conversationRepository: IConversationRepository =
  process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new SupabaseConversationRepository()
    : new MockConversationRepository();
