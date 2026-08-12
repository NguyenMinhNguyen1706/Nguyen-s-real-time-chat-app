export type UserPresenceStatus = "online" | "offline" | "away";

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  status: UserPresenceStatus;
  statusMessage?: string;
}

export type ConversationType = "direct" | "group";

export type ConversationCategory = "all" | "unread" | "favorites" | "archived";

export type ConversationSortOption = "newest" | "unread" | "name";

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  timestamp: string; // ISO string
  status: MessageStatus;
  isUnread?: boolean;
  isEdited?: boolean;
}

export interface MessageGroup {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  isOutgoing: boolean;
  messages: Message[];
}

export interface MessagePreview {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string; // ISO string
  isUnread: boolean;
}

export interface ConversationPreview {
  id: string;
  title: string;
  type: ConversationType;
  avatarUrl?: string;
  participants: UserSummary[];
  lastMessage?: MessagePreview;
  unreadCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isOnline?: boolean;
  presenceStatus?: UserPresenceStatus;
  updatedAt: string; // ISO string
}
