import { createClient } from "@/lib/supabase/client";
import type { UserPresenceStatus } from "@/types/chat";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface UserPresenceState {
  userId: string;
  name: string;
  status: UserPresenceStatus;
  onlineAt: string;
}

export type PresenceChangeCallback = (onlineUsers: Map<string, UserPresenceState>) => void;

export class PresenceService {
  private channel: RealtimeChannel | null = null;
  private onlineUsers: Map<string, UserPresenceState> = new Map();
  private listeners: Set<PresenceChangeCallback> = new Set();
  private currentUserId: string | null = null;

  trackPresence(
    userId: string,
    name: string,
    status: UserPresenceStatus = "online",
    customClient?: SupabaseClient | null,
  ): () => void {
    const supabase = customClient || createClient();
    if (!supabase) return () => {};

    if (this.channel) {
      this.untrackPresence();
    }

    this.currentUserId = userId;
    this.channel = supabase.channel("global_presence", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    this.channel
      .on("presence", { event: "sync" }, () => {
        const state = this.channel?.presenceState<UserPresenceState>();
        if (!state) return;

        const newMap = new Map<string, UserPresenceState>();
        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            newMap.set(key, presences[0]);
          }
        });

        this.onlineUsers = newMap;
        this.notifyListeners();
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (newPresences && newPresences.length > 0) {
          this.onlineUsers.set(key, newPresences[0] as unknown as UserPresenceState);
          this.notifyListeners();
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        this.onlineUsers.delete(key);
        this.notifyListeners();
      })
      .subscribe(async (statusResult) => {
        if (statusResult === "SUBSCRIBED" && this.channel) {
          await this.channel.track({
            userId,
            name,
            status,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      this.untrackPresence();
    };
  }

  untrackPresence(): void {
    if (this.channel) {
      this.channel.untrack();
      this.channel.unsubscribe();
      const supabase = createClient();
      if (supabase) {
        supabase.removeChannel(this.channel);
      }
      this.channel = null;
    }
    this.onlineUsers.clear();
    this.currentUserId = null;
    this.notifyListeners();
  }

  subscribePresenceChanges(callback: PresenceChangeCallback): () => void {
    this.listeners.add(callback);
    callback(new Map(this.onlineUsers));

    return () => {
      this.listeners.delete(callback);
    };
  }

  getOnlineUsers(): Map<string, UserPresenceState> {
    return new Map(this.onlineUsers);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private notifyListeners(): void {
    const copy = new Map(this.onlineUsers);
    this.listeners.forEach((listener) => listener(copy));
  }
}

export const presenceService = new PresenceService();
