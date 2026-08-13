import { createClient } from "@/lib/supabase/client";
import type { CreateMessageInput, Message } from "@/types/chat";
import type { IMessageRepository } from "@/repositories/message-repository";

export class SupabaseMessageRepository implements IMessageRepository {
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data: rows, error } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        status,
        is_edited,
        reply_to_message_id,
        profiles:sender_id (
          display_name,
          avatar_path
        ),
        message_reactions (
          id,
          emoji,
          user_id,
          profiles:user_id (
            display_name
          )
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !rows) {
      return [];
    }

    return rows.map((row) => {
      const sender = row.profiles as unknown as { display_name: string; avatar_path: string | null } | null;
      const reactions = ((row.message_reactions as unknown as Array<{
        id: string;
        emoji: string;
        user_id: string;
        profiles: { display_name: string } | null;
      }>) || []).map((r) => ({
        id: r.id,
        messageId: row.id,
        emoji: r.emoji,
        userId: r.user_id,
        userName: r.profiles?.display_name || "User",
      }));

      return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        senderName: sender?.display_name || "User",
        senderAvatarUrl: sender?.avatar_path || undefined,
        content: row.content,
        timestamp: row.created_at,
        status: (row.status as Message["status"]) || "sent",
        isEdited: row.is_edited ?? false,
        replyToMessageId: row.reply_to_message_id || undefined,
        replyToMessagePreview: undefined,
        reactions,
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTypingUsers(conversationId?: string): Promise<string[]> {
    // NOT IMPLEMENTED IN TASK 13 - Typing indicators deferred to Task 14 Realtime
    return [];
  }

  async sendMessage(input: CreateMessageInput): Promise<Message> {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase client unavailable");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_path")
      .eq("id", user.id)
      .maybeSingle();

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: input.conversationId,
        sender_id: user.id,
        content: input.content,
        reply_to_message_id: input.replyToMessageId || null,
        status: "sent",
      })
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to send message: ${error?.message || "Unknown error"}`);
    }

    // Update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", input.conversationId);

    return {
      id: inserted.id,
      conversationId: inserted.conversation_id,
      senderId: inserted.sender_id,
      senderName: profile?.display_name || user.user_metadata?.display_name || "User",
      senderAvatarUrl: profile?.avatar_path || undefined,
      content: inserted.content,
      timestamp: inserted.created_at,
      status: inserted.status as Message["status"],
      replyToMessageId: inserted.reply_to_message_id || undefined,
      replyToMessagePreview: input.replyToMessagePreview,
      reactions: [],
    };
  }

  async toggleReaction(
    messageId: string,
    emoji: string,
    userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userName: string,
  ): Promise<Message | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: existing } = await supabase
      .from("message_reactions")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", userId)
      .eq("emoji", emoji)
      .maybeSingle();

    if (existing) {
      await supabase.from("message_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: userId,
        emoji,
      });
    }

    const { data: msgRow } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("id", messageId)
      .maybeSingle();

    if (!msgRow) return null;
    const messages = await this.getMessagesByConversationId(msgRow.conversation_id);
    return messages.find((m) => m.id === messageId) || null;
  }

  async editMessage(messageId: string, newContent: string): Promise<Message | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data: updated, error } = await supabase
      .from("messages")
      .update({
        content: newContent,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .select("conversation_id")
      .single();

    if (error || !updated) return null;

    const messages = await this.getMessagesByConversationId(updated.conversation_id);
    return messages.find((m) => m.id === messageId) || null;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("messages").delete().eq("id", messageId);
    return !error;
  }
}
