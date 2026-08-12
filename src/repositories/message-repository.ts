import { MOCK_MESSAGES_MAP, MOCK_TYPING_USERS } from "@/repositories/mock/mock-messages";
import type { CreateMessageInput, Message } from "@/types/chat";

export interface IMessageRepository {
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getTypingUsers(conversationId: string): Promise<string[]>;
  sendMessage(input: CreateMessageInput): Promise<Message>;
}

export class MockMessageRepository implements IMessageRepository {
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return MOCK_MESSAGES_MAP[conversationId] ?? [];
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return MOCK_TYPING_USERS[conversationId] ?? [];
  }

  async sendMessage(input: CreateMessageInput): Promise<Message> {
    await new Promise((resolve) => setTimeout(resolve, 30));

    const newMessage: Message = {
      id: `client_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      conversationId: input.conversationId,
      senderId: "usr_current",
      senderName: "Nguyen Minh",
      content: input.content,
      timestamp: new Date().toISOString(),
      status: "pending",
      attachment: input.attachment,
    };

    if (!MOCK_MESSAGES_MAP[input.conversationId]) {
      MOCK_MESSAGES_MAP[input.conversationId] = [];
    }

    MOCK_MESSAGES_MAP[input.conversationId].push(newMessage);
    return newMessage;
  }
}

export const messageRepository = new MockMessageRepository();
