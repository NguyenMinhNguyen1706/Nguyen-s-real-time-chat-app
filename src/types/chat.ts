export type UserPresenceStatus = "online" | "offline" | "away" | "busy";

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  status: UserPresenceStatus;
  statusMessage?: string;
  presenceStatus?: UserPresenceStatus;
}

export type ConversationType = "direct" | "group";

export type ConversationCategory = "all" | "unread" | "favorites" | "archived";

export type ConversationSortOption = "newest" | "unread" | "name";

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface AttachmentPreview {
  id: string;
  name: string;
  size: number; // in bytes
  type: string; // MIME type
  url?: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  emoji: string;
  userId: string;
  userName: string;
}

export interface CreateMessageInput {
  conversationId: string;
  content: string;
  attachment?: AttachmentPreview;
  replyToMessageId?: string;
  replyToMessagePreview?: {
    senderName: string;
    content: string;
  };
}

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
  attachment?: AttachmentPreview;
  replyToMessageId?: string;
  replyToMessagePreview?: {
    senderName: string;
    content: string;
  };
  reactions?: MessageReaction[];
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
