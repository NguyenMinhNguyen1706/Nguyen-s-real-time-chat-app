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

  it("sends a message and appends it to mock messages map", async () => {
    const created = await repo.sendMessage({
      conversationId: "conv_1",
      content: "Hello from unit test!",
    });

    expect(created.id).toContain("client_msg_");
    expect(created.content).toBe("Hello from unit test!");
    expect(created.status).toBe("pending");

    const updatedList = await repo.getMessagesByConversationId("conv_1");
    expect(updatedList.some((m) => m.id === created.id)).toBe(true);
  });

  it("toggles emoji reaction on a message", async () => {
    const messages = await repo.getMessagesByConversationId("conv_1");
    const targetMsg = messages[0];

    const updated1 = await repo.toggleReaction(targetMsg.id, "👍", "usr_current", "Nguyen Minh");
    expect(updated1?.reactions?.some((r) => r.emoji === "👍" && r.userId === "usr_current")).toBe(
      true,
    );

    // Toggle off
    const updated2 = await repo.toggleReaction(targetMsg.id, "👍", "usr_current", "Nguyen Minh");
    expect(updated2?.reactions?.some((r) => r.emoji === "👍" && r.userId === "usr_current")).toBe(
      false,
    );
  });

  it("edits message content and sets isEdited flag", async () => {
    const messages = await repo.getMessagesByConversationId("conv_1");
    const targetMsg = messages[0];

    const edited = await repo.editMessage(targetMsg.id, "Edited content from test");
    expect(edited?.content).toBe("Edited content from test");
    expect(edited?.isEdited).toBe(true);
  });

  it("deletes a message from repository state", async () => {
    const created = await repo.sendMessage({
      conversationId: "conv_1",
      content: "Message to be deleted",
    });

    const deleted = await repo.deleteMessage(created.id);
    expect(deleted).toBe(true);

    const listAfter = await repo.getMessagesByConversationId("conv_1");
    expect(listAfter.some((m) => m.id === created.id)).toBe(false);
  });
});
