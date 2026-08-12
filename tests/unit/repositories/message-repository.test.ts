import { describe, expect, it } from "vitest";

import { MockMessageRepository } from "@/repositories/message-repository";

describe("MockMessageRepository", () => {
  const repo = new MockMessageRepository();

  it("fetches messages for a given conversation id", async () => {
    const messages = await repo.getMessagesByConversationId("conv_1");
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].conversationId).toBe("conv_1");
  });

  it("returns empty array for non-existent conversation or conv_empty", async () => {
    const emptyMsgs = await repo.getMessagesByConversationId("conv_empty");
    expect(emptyMsgs).toEqual([]);

    const invalidMsgs = await repo.getMessagesByConversationId("non_existent");
    expect(invalidMsgs).toEqual([]);
  });

  it("fetches active typing users for a conversation", async () => {
    const typers = await repo.getTypingUsers("conv_1");
    expect(typers).toContain("Sarah Chen");

    const noTypers = await repo.getTypingUsers("conv_2");
    expect(noTypers).toEqual([]);
  });
});
