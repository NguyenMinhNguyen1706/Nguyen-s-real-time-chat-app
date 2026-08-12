import { describe, expect, it } from "vitest";

import { getAvailableMessageActions } from "@/lib/message-actions";
import type { Message } from "@/types/chat";

describe("Message Actions Rule Engine", () => {
  const dummyMessage: Message = {
    id: "msg_101",
    conversationId: "conv_1",
    senderId: "usr_sarah",
    senderName: "Sarah Chen",
    content: "Test content",
    timestamp: new Date().toISOString(),
    status: "delivered",
  };

  it("returns React, Reply, Copy for incoming messages", () => {
    const actions = getAvailableMessageActions(dummyMessage, false);
    const types = actions.map((a) => a.type);
    expect(types).toEqual(["react", "reply", "copy"]);
    expect(types).not.toContain("edit");
    expect(types).not.toContain("delete");
  });

  it("returns React, Reply, Copy, Edit, Delete for outgoing messages", () => {
    const actions = getAvailableMessageActions(dummyMessage, true);
    const types = actions.map((a) => a.type);
    expect(types).toEqual(["react", "reply", "copy", "edit", "delete"]);
  });
});
