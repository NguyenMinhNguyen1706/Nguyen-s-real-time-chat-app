import { describe, expect, it } from "vitest";

import { SupabaseConversationRepository } from "@/repositories/supabase-conversation-repository";
import { SupabaseMessageRepository } from "@/repositories/supabase-message-repository";

describe("SupabaseConversationRepository Unit Contract", () => {
  it("instantiates correctly and implements IConversationRepository interface", () => {
    const repo = new SupabaseConversationRepository();
    expect(repo.getCurrentUser).toBeDefined();
    expect(repo.getConversations).toBeDefined();
    expect(repo.getConversationById).toBeDefined();
    expect(repo.togglePinConversation).toBeDefined();
    expect(repo.toggleMuteConversation).toBeDefined();
  });

  it("returns fallback current user when Supabase client is not available or unauthenticated", async () => {
    const repo = new SupabaseConversationRepository();
    const user = await repo.getCurrentUser();
    expect(user.id).toBeDefined();
    expect(user.name).toBeDefined();
  });

  it("returns empty array for getConversations when unauthenticated", async () => {
    const repo = new SupabaseConversationRepository();
    const conversations = await repo.getConversations();
    expect(Array.isArray(conversations)).toBe(true);
  });
});

describe("SupabaseMessageRepository Unit Contract", () => {
  it("instantiates correctly and implements IMessageRepository interface", () => {
    const repo = new SupabaseMessageRepository();
    expect(repo.getMessagesByConversationId).toBeDefined();
    expect(repo.getTypingUsers).toBeDefined();
    expect(repo.sendMessage).toBeDefined();
    expect(repo.toggleReaction).toBeDefined();
    expect(repo.editMessage).toBeDefined();
    expect(repo.deleteMessage).toBeDefined();
  });

  it("returns empty messages array when unauthenticated or for empty conversation", async () => {
    const repo = new SupabaseMessageRepository();
    const messages = await repo.getMessagesByConversationId("non-existent-conv-id");
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(0);
  });

  it("returns empty typing users array as typing indicators are deferred to Task 14", async () => {
    const repo = new SupabaseMessageRepository();
    const typing = await repo.getTypingUsers("conv_123");
    expect(typing).toEqual([]);
  });
});
