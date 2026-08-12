import { describe, expect, it } from "vitest";

import { formatDateSeparator, formatMessageTime } from "@/lib/format";
import { groupConsecutiveMessages, partitionMessagesByDate } from "@/lib/message-grouping";
import type { Message } from "@/types/chat";

describe("message-grouping & formatting logic", () => {
  it("formats message time in 12-hour AM/PM format", () => {
    const timeString = formatMessageTime("2026-08-12T14:25:00.000Z");
    expect(timeString).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });

  it("formats date separator correctly", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    expect(formatDateSeparator("2026-08-12T08:00:00.000Z", now)).toBe("Today");
    expect(formatDateSeparator("2026-08-11T08:00:00.000Z", now)).toBe("Yesterday");
  });

  it("groups consecutive messages from the same sender within 5 minutes", () => {
    const messages: Message[] = [
      {
        id: "m1",
        conversationId: "conv_1",
        senderId: "usr_1",
        senderName: "Sarah Chen",
        content: "Hello",
        timestamp: "2026-08-12T10:00:00.000Z",
        status: "read",
      },
      {
        id: "m2",
        conversationId: "conv_1",
        senderId: "usr_1",
        senderName: "Sarah Chen",
        content: "How are you?",
        timestamp: "2026-08-12T10:02:00.000Z",
        status: "read",
      },
      {
        id: "m3",
        conversationId: "conv_1",
        senderId: "usr_current",
        senderName: "Nguyen Minh",
        content: "Doing well!",
        timestamp: "2026-08-12T10:03:00.000Z",
        status: "delivered",
      },
    ];

    const groups = groupConsecutiveMessages(messages, "usr_current");
    expect(groups.length).toBe(2);
    expect(groups[0].messages.length).toBe(2);
    expect(groups[0].isOutgoing).toBe(false);
    expect(groups[1].messages.length).toBe(1);
    expect(groups[1].isOutgoing).toBe(true);
  });

  it("partitions messages into date buckets", () => {
    const messages: Message[] = [
      {
        id: "m1",
        conversationId: "conv_1",
        senderId: "usr_1",
        senderName: "Sarah",
        content: "Msg 1",
        timestamp: "2026-08-11T10:00:00.000Z",
        status: "read",
      },
      {
        id: "m2",
        conversationId: "conv_1",
        senderId: "usr_1",
        senderName: "Sarah",
        content: "Msg 2",
        timestamp: "2026-08-12T10:00:00.000Z",
        status: "read",
      },
    ];

    const partitions = partitionMessagesByDate(messages);
    expect(partitions.length).toBe(2);
    expect(partitions[0].messages.length).toBe(1);
    expect(partitions[1].messages.length).toBe(1);
  });
});
