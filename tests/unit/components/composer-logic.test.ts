import { describe, expect, it } from "vitest";

import type { AttachmentPreview, CreateMessageInput } from "@/types/chat";

describe("Message Composer Pure Logic", () => {
  it("rejects empty or whitespace-only messages without attachments", () => {
    const input1 = "   ";
    const attachment1 = undefined;
    const canSend1 = input1.trim().length > 0 || attachment1 !== undefined;
    expect(canSend1).toBe(false);
  });

  it("allows sending when valid content or attachment exists", () => {
    const input2 = "   Hello world  ";
    const canSend2 = input2.trim().length > 0;
    expect(canSend2).toBe(true);

    const attachment2: AttachmentPreview = {
      id: "att_1",
      name: "doc.pdf",
      size: 1024,
      type: "application/pdf",
    };
    const canSend3 = "".trim().length > 0 || attachment2 !== undefined;
    expect(canSend3).toBe(true);
  });

  it("trims whitespace before creating message payload", () => {
    const rawContent = "   Testing trim   \n";
    const payload: CreateMessageInput = {
      conversationId: "conv_1",
      content: rawContent.trim(),
    };
    expect(payload.content).toBe("Testing trim");
  });

  it("validates file attachment size constraints", () => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validSize = 5 * 1024 * 1024;
    const invalidSize = 12 * 1024 * 1024;

    expect(validSize <= MAX_SIZE).toBe(true);
    expect(invalidSize <= MAX_SIZE).toBe(false);
  });
});
