import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface TypingPayload {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export type TypingUsersChangeCallback = (typingUserNames: string[]) => void;

export class TypingService {
  private activeChannel: RealtimeChannel | null = null;
  private currentConversationId: string | null = null;
  private typingMap: Map<string, { userName: string; timer: NodeJS.Timeout }> = new Map();
  private listeners: Set<TypingUsersChangeCallback> = new Set();
  private localTypingTimer: NodeJS.Timeout | null = null;
  private lastBroadcastTime = 0;

  subscribeTyping(
    conversationId: string,
    currentUserId: string,
    callback: TypingUsersChangeCallback,
    customClient?: SupabaseClient | null,
  ): () => void {
    const supabase = customClient || createClient();
    if (!supabase) return () => {};

    if (this.currentConversationId !== conversationId) {
      this.unsubscribeTyping();
    }

    this.currentConversationId = conversationId;
    this.listeners.add(callback);

    if (!this.activeChannel) {
      const channelName = `typing:${conversationId}`;
      this.activeChannel = supabase.channel(channelName);

      this.activeChannel
        .on("broadcast", { event: "typing" }, (payload) => {
          const data = payload.payload as TypingPayload;
          if (!data || data.userId === currentUserId) return;

          if (data.isTyping) {
            const existing = this.typingMap.get(data.userId);
            if (existing) clearTimeout(existing.timer);

            const timer = setTimeout(() => {
              this.typingMap.delete(data.userId);
              this.notifyListeners();
            }, 3500);

            this.typingMap.set(data.userId, { userName: data.userName, timer });
          } else {
            const existing = this.typingMap.get(data.userId);
            if (existing) clearTimeout(existing.timer);
            this.typingMap.delete(data.userId);
          }

          this.notifyListeners();
        })
        .subscribe();
    }

    callback(this.getTypingUserNames());

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.unsubscribeTyping();
      }
    };
  }

  sendTypingSignal(
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
    customClient?: SupabaseClient | null,
  ): void {
    const supabase = customClient || createClient();
    if (!supabase) return;

    if (!this.activeChannel || this.currentConversationId !== conversationId) {
      this.subscribeTyping(conversationId, userId, () => {}, customClient);
    }

    const now = Date.now();

    if (isTyping) {
      if (now - this.lastBroadcastTime > 600) {
        if (this.activeChannel) {
          this.activeChannel.send({
            type: "broadcast",
            event: "typing",
            payload: { userId, userName, isTyping: true },
          });
        }
        this.lastBroadcastTime = now;
      }

      if (this.localTypingTimer) clearTimeout(this.localTypingTimer);
      this.localTypingTimer = setTimeout(() => {
        this.sendTypingSignal(conversationId, userId, userName, false, customClient);
      }, 3000);
    } else {
      if (this.localTypingTimer) {
        clearTimeout(this.localTypingTimer);
        this.localTypingTimer = null;
      }
      if (this.activeChannel) {
        this.activeChannel.send({
          type: "broadcast",
          event: "typing",
          payload: { userId, userName, isTyping: false },
        });
      }
      this.lastBroadcastTime = 0;
    }
  }

  stopTypingImmediately(
    conversationId: string,
    userId: string,
    userName: string,
    customClient?: SupabaseClient | null,
  ): void {
    this.sendTypingSignal(conversationId, userId, userName, false, customClient);
  }

  unsubscribeTyping(): void {
    if (this.localTypingTimer) {
      clearTimeout(this.localTypingTimer);
      this.localTypingTimer = null;
    }

    this.typingMap.forEach(({ timer }) => clearTimeout(timer));
    this.typingMap.clear();

    if (this.activeChannel) {
      this.activeChannel.unsubscribe();
      const supabase = createClient();
      if (supabase) {
        supabase.removeChannel(this.activeChannel);
      }
      this.activeChannel = null;
    }

    this.currentConversationId = null;
    this.listeners.clear();
  }

  getTypingUserNames(): string[] {
    return Array.from(this.typingMap.values()).map((v) => v.userName);
  }

  private notifyListeners(): void {
    const names = this.getTypingUserNames();
    this.listeners.forEach((listener) => listener(names));
  }
}

export const typingService = new TypingService();
