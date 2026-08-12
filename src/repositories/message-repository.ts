import { MOCK_MESSAGES_MAP, MOCK_TYPING_USERS } from "@/repositories/mock/mock-messages";
import type { Message } from "@/types/chat";

export interface IMessageRepository {
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getTypingUsers(conversationId: string): Promise<string[]>;
}

export class MockMessageRepository implements IMessageRepository {
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    // Simulate slight async network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 20));
    return MOCK_MESSAGES_MAP[conversationId] ?? [];
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return MOCK_TYPING_USERS[conversationId] ?? [];
  }
}

export const messageRepository = new MockMessageRepository();
