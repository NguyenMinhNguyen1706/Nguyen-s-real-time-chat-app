import { describe, expect, it } from "vitest";

import { MockConversationRepository } from "@/repositories/conversation-repository";

describe("MockConversationRepository", () => {
  const repo = new MockConversationRepository();

  it("returns current user summary", async () => {
    const user = await repo.getCurrentUser();
    expect(user.id).toBe("usr_current");
    expect(user.name).toBe("Nguyen Minh");
    expect(user.status).toBe("online");
  });

  it("filters unread conversations", async () => {
    const unread = await repo.getConversations("unread");
    expect(unread.length).toBeGreaterThan(0);
    unread.forEach((c) => expect(c.unreadCount).toBeGreaterThan(0));
  });

  it("filters favorite / pinned conversations", async () => {
    const favorites = await repo.getConversations("favorites");
    expect(favorites.length).toBeGreaterThan(0);
    favorites.forEach((c) => expect(c.isFavorite || c.isPinned).toBe(true));
  });

  it("filters archived conversations", async () => {
    const archived = await repo.getConversations("archived");
    expect(archived.length).toBe(1);
    expect(archived[0].isArchived).toBe(true);
  });

  it("searches conversations by title or message content", async () => {
    const results = await repo.getConversations("all", "Sarah");
    expect(results.length).toBe(1);
    expect(results[0].title).toBe("Sarah Chen");
  });

  it("sorts conversations by name", async () => {
    const results = await repo.getConversations("all", "", "name");
    expect(results[0].title.localeCompare(results[1].title)).toBeLessThanOrEqual(0);
  });

  it("toggles pin status on conversation", async () => {
    const initial = await repo.getConversationById("conv_3");
    expect(initial?.isPinned).toBe(false);

    const updated = await repo.togglePinConversation("conv_3");
    expect(updated?.isPinned).toBe(true);

    // Toggle back
    await repo.togglePinConversation("conv_3");
  });

  it("toggles mute status on conversation", async () => {
    const initial = await repo.getConversationById("conv_1");
    expect(initial?.isMuted).toBe(false);

    const updated = await repo.toggleMuteConversation("conv_1");
    expect(updated?.isMuted).toBe(true);

    // Toggle back
    await repo.toggleMuteConversation("conv_1");
  });

  it("returns null for non-existent conversation id", async () => {
    const result = await repo.getConversationById("invalid_id");
    expect(result).toBeNull();
  });
});
