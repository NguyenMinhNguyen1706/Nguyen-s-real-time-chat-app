import { MOCK_MESSAGES_MAP, MOCK_TYPING_USERS } from "@/repositories/mock/mock-messages";
import type { CreateMessageInput, Message } from "@/types/chat";

export interface IMessageRepository {
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getTypingUsers(conversationId: string): Promise<string[]>;
  sendMessage(input: CreateMessageInput): Promise<Message>;
  toggleReaction(
    messageId: string,
    emoji: string,
    userId: string,
    userName: string,
  ): Promise<Message | null>;
  editMessage(messageId: string, newContent: string): Promise<Message | null>;
  deleteMessage(messageId: string): Promise<boolean>;
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
      replyToMessageId: input.replyToMessageId,
      replyToMessagePreview: input.replyToMessagePreview,
      reactions: [],
    };

    if (!MOCK_MESSAGES_MAP[input.conversationId]) {
      MOCK_MESSAGES_MAP[input.conversationId] = [];
    }

    MOCK_MESSAGES_MAP[input.conversationId].push(newMessage);
    return newMessage;
  }

  async toggleReaction(
    messageId: string,
    emoji: string,
    userId: string,
    userName: string,
  ): Promise<Message | null> {
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (const convId in MOCK_MESSAGES_MAP) {
      const msgs = MOCK_MESSAGES_MAP[convId];
      const targetIndex = msgs.findIndex((m) => m.id === messageId);
      if (targetIndex !== -1) {
        const msg = msgs[targetIndex];
        const reactions = msg.reactions ?? [];
        const existingIndex = reactions.findIndex((r) => r.emoji === emoji && r.userId === userId);

        let updatedReactions;
        if (existingIndex !== -1) {
          // Remove reaction
          updatedReactions = reactions.filter((_, idx) => idx !== existingIndex);
        } else {
          // Add reaction
          updatedReactions = [
            ...reactions,
            {
              id: `react_${Date.now()}`,
              messageId,
              emoji,
              userId,
              userName,
            },
          ];
        }

        const updatedMsg = { ...msg, reactions: updatedReactions };
        msgs[targetIndex] = updatedMsg;
        return updatedMsg;
      }
    }
    return null;
  }

  async editMessage(messageId: string, newContent: string): Promise<Message | null> {
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (const convId in MOCK_MESSAGES_MAP) {
      const msgs = MOCK_MESSAGES_MAP[convId];
      const targetIndex = msgs.findIndex((m) => m.id === messageId);
      if (targetIndex !== -1) {
        const msg = msgs[targetIndex];
        const updatedMsg = {
          ...msg,
          content: newContent,
          isEdited: true,
        };
        msgs[targetIndex] = updatedMsg;
        return updatedMsg;
      }
    }
    return null;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (const convId in MOCK_MESSAGES_MAP) {
      const msgs = MOCK_MESSAGES_MAP[convId];
      const targetIndex = msgs.findIndex((m) => m.id === messageId);
      if (targetIndex !== -1) {
        msgs.splice(targetIndex, 1);
        return true;
      }
    }
    return false;
  }
}

export const messageRepository = new MockMessageRepository();
