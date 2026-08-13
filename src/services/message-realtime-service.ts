import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/chat";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export interface MessageRealtimeHandlers {
  onInsert?: (message: Message) => void;
  onUpdate?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export class MessageRealtimeService {
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  subscribeToConversation(
    conversationId: string,
    handlers: MessageRealtimeHandlers,
    customClient?: SupabaseClient | null,
  ): () => void {
    const supabase = customClient || createClient();
    if (!supabase) return () => {};

    if (this.activeChannels.has(conversationId)) {
      this.unsubscribeFromConversation(conversationId);
    }

    const channelName = `messages:${conversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (!handlers.onInsert || !payload.new) return;
          const newRow = payload.new;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_path")
            .eq("id", newRow.sender_id)
            .maybeSingle();

          const message: Message = {
            id: newRow.id,
            conversationId: newRow.conversation_id,
            senderId: newRow.sender_id,
            senderName: profile?.display_name || "User",
            senderAvatarUrl: profile?.avatar_path || undefined,
            content: newRow.content,
            timestamp: newRow.created_at,
            status: (newRow.status as Message["status"]) || "sent",
            isEdited: newRow.is_edited ?? false,
            replyToMessageId: newRow.reply_to_message_id || undefined,
            reactions: [],
          };

          handlers.onInsert(message);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (!handlers.onUpdate || !payload.new) return;
          const updatedRow = payload.new;

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_path")
            .eq("id", updatedRow.sender_id)
            .maybeSingle();

          const message: Message = {
            id: updatedRow.id,
            conversationId: updatedRow.conversation_id,
            senderId: updatedRow.sender_id,
            senderName: profile?.display_name || "User",
            senderAvatarUrl: profile?.avatar_path || undefined,
            content: updatedRow.content,
            timestamp: updatedRow.created_at,
            status: (updatedRow.status as Message["status"]) || "sent",
            isEdited: updatedRow.is_edited ?? false,
            replyToMessageId: updatedRow.reply_to_message_id || undefined,
            reactions: [],
          };

          handlers.onUpdate(message);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!handlers.onDelete || !payload.old) return;
          handlers.onDelete(payload.old.id);
        },
      )
      .subscribe();

    this.activeChannels.set(conversationId, channel);

    return () => {
      this.unsubscribeFromConversation(conversationId);
    };
  }

  unsubscribeFromConversation(conversationId: string): void {
    const channel = this.activeChannels.get(conversationId);
    if (channel) {
      channel.unsubscribe();
      const supabase = createClient();
      if (supabase) {
        supabase.removeChannel(channel);
      }
      this.activeChannels.delete(conversationId);
    }
  }

  unsubscribeAll(): void {
    this.activeChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.activeChannels.clear();
  }
}

export const messageRealtimeService = new MessageRealtimeService();
