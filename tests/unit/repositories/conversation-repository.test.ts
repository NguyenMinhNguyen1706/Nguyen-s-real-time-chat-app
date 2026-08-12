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

  it("filters favorite conversations", async () => {
    const favorites = await repo.getConversations("favorites");
    expect(favorites.length).toBeGreaterThan(0);
    favorites.forEach((c) => expect(c.isFavorite).toBe(true));
  });

  it("searches conversations by title or message content", async () => {
    const results = await repo.getConversations("all", "Sarah");
    expect(results.length).toBe(1);
    expect(results[0].title).toBe("Sarah Chen");
  });

  it("returns null for non-existent conversation id", async () => {
    const result = await repo.getConversationById("invalid_id");
    expect(result).toBeNull();
  });
});
