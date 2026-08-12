export type SearchResultType = "conversation" | "message";

export type SearchCategoryTab = "all" | "messages" | "conversations";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  conversationId: string;
  messageId?: string;
  title: string;
  subtitle: string;
  content: string;
  timestamp: string;
  avatarUrl?: string;
  matchScore: number;
}
