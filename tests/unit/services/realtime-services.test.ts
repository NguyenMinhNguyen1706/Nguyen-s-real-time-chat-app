import { describe, expect, it } from "vitest";

import { MessageRealtimeService } from "@/services/message-realtime-service";
import { PresenceService } from "@/services/presence-service";
import { TypingService } from "@/services/typing-service";

describe("MessageRealtimeService Unit Contract", () => {
  it("instantiates correctly and provides subscription methods", () => {
    const service = new MessageRealtimeService();
    expect(service.subscribeToConversation).toBeDefined();
    expect(service.unsubscribeFromConversation).toBeDefined();
    expect(service.unsubscribeAll).toBeDefined();
  });

  it("handles unsubscription safely when no active channels exist", () => {
    const service = new MessageRealtimeService();
    expect(() => service.unsubscribeFromConversation("non-existent")).not.toThrow();
    expect(() => service.unsubscribeAll()).not.toThrow();
  });
});

describe("PresenceService Unit Contract", () => {
  it("instantiates correctly and tracks online presence state", () => {
    const service = new PresenceService();
    expect(service.trackPresence).toBeDefined();
    expect(service.untrackPresence).toBeDefined();
    expect(service.subscribePresenceChanges).toBeDefined();
    expect(service.getOnlineUsers).toBeDefined();
    expect(service.isUserOnline).toBeDefined();
  });

  it("returns false for isUserOnline when empty or un-tracked", () => {
    const service = new PresenceService();
    expect(service.isUserOnline("user_unknown")).toBe(false);
  });
});

describe("TypingService Unit Contract", () => {
  it("instantiates correctly and manages typing broadcast signals", () => {
    const service = new TypingService();
    expect(service.subscribeTyping).toBeDefined();
    expect(service.sendTypingSignal).toBeDefined();
    expect(service.stopTypingImmediately).toBeDefined();
    expect(service.unsubscribeTyping).toBeDefined();
    expect(service.getTypingUserNames).toBeDefined();
  });

  it("returns empty typing names array initially", () => {
    const service = new TypingService();
    expect(service.getTypingUserNames()).toEqual([]);
  });
});
