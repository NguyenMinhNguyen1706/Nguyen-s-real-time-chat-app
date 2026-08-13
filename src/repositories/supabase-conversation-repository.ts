import { createClient } from "@/lib/supabase/client";
import type {
  ConversationCategory,
  ConversationPreview,
  ConversationSortOption,
  UserSummary,
} from "@/types/chat";
import type { IConversationRepository } from "@/repositories/conversation-repository";

export class SupabaseConversationRepository implements IConversationRepository {
  async getCurrentUser(): Promise<UserSummary> {
    const supabase = createClient();
    if (!supabase) {
      return {
        id: "usr_current",
        name: "Anonymous User",
        username: "anonymous",
        status: "online",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        id: "usr_current",
        name: "Anonymous User",
        username: "anonymous",
        status: "online",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      name: profile?.display_name || user.user_metadata?.display_name || "User",
      username: profile?.username || user.user_metadata?.username || "user",
      avatarUrl: profile?.avatar_path || undefined,
      status: (profile?.presence_status as UserSummary["status"]) || "online",
      statusMessage: profile?.custom_status || undefined,
    };
  }

  async getConversations(
    category: ConversationCategory = "all",
    searchQuery: string = "",
    sortBy: ConversationSortOption = "newest",
  ): Promise<ConversationPreview[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Query conversation_members for the authenticated user
    const { data: memberRows, error: memberErr } = await supabase
      .from("conversation_members")
      .select(`
        conversation_id,
        is_favorite,
        is_pinned,
        is_muted,
        is_archived,
        last_read_at,
        conversations (
          id,
          type,
          title,
          updated_at,
          conversation_members (
            user_id,
            profiles (
              id,
              display_name,
              username,
              avatar_path,
              presence_status,
              custom_status
            )
          )
        )
      `)
      .eq("user_id", user.id);

    if (memberErr || !memberRows) {
      return [];
    }

    const conversationPreviews: ConversationPreview[] = [];

    for (const row of memberRows) {
      const conv = row.conversations as unknown as {
        id: string;
        type: string;
        title: string | null;
        updated_at: string;
        conversation_members: Array<{
          user_id: string;
          profiles: {
            id: string;
            display_name: string;
            username: string;
            avatar_path: string | null;
            presence_status: string;
            custom_status: string | null;
          } | null;
        }>;
      } | null;

      if (!conv) continue;

      // Extract participants
      const participants: UserSummary[] = (conv.conversation_members || []).map((cm) => {
        const p = cm.profiles;
        return {
          id: p?.id || cm.user_id,
          name: p?.display_name || "Member",
          username: p?.username || "member",
          avatarUrl: p?.avatar_path || undefined,
          status: (p?.presence_status as UserSummary["status"]) || "offline",
          statusMessage: p?.custom_status || undefined,
        };
      });

      // Fetch last message for this conversation
      const { data: lastMsgRows } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          content,
          created_at,
          profiles:sender_id (display_name)
        `)
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      let lastMessagePreview = undefined;
      if (lastMsgRows && lastMsgRows.length > 0) {
        const lm = lastMsgRows[0];
        const senderProfile = lm.profiles as unknown as { display_name: string } | null;
        lastMessagePreview = {
          id: lm.id,
          senderId: lm.sender_id,
          senderName: senderProfile?.display_name || "User",
          content: lm.content,
          timestamp: lm.created_at,
          isUnread: row.last_read_at ? new Date(lm.created_at) > new Date(row.last_read_at) : true,
        };
      }

      // Compute unread count
      let unreadCount = 0;
      if (row.last_read_at) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .gt("created_at", row.last_read_at)
          .neq("sender_id", user.id);
        unreadCount = count || 0;
      } else {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);
        unreadCount = count || 0;
      }

      // Title & avatar for direct message vs group
      let title = conv.title || "Conversation";
      let avatarUrl = undefined;
      let presenceStatus: UserSummary["status"] | undefined = undefined;

      if (conv.type === "direct") {
        const otherParticipant = participants.find((p) => p.id !== user.id) || participants[0];
        if (otherParticipant) {
          title = otherParticipant.name;
          avatarUrl = otherParticipant.avatarUrl;
          presenceStatus = otherParticipant.status;
        }
      }

      conversationPreviews.push({
        id: conv.id,
        title,
        type: conv.type as ConversationPreview["type"],
        avatarUrl,
        participants,
        lastMessage: lastMessagePreview,
        unreadCount,
        isFavorite: row.is_favorite ?? false,
        isPinned: row.is_pinned ?? false,
        isMuted: row.is_muted ?? false,
        isArchived: row.is_archived ?? false,
        presenceStatus,
        updatedAt: conv.updated_at || new Date().toISOString(),
      });
    }

    // Apply category filter
    let result = conversationPreviews;
    if (category === "unread") {
      result = result.filter((c) => !c.isArchived && c.unreadCount > 0);
    } else if (category === "favorites") {
      result = result.filter((c) => !c.isArchived && (c.isFavorite || c.isPinned));
    } else if (category === "archived") {
      result = result.filter((c) => c.isArchived);
    } else {
      result = result.filter((c) => !c.isArchived);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.lastMessage && c.lastMessage.content.toLowerCase().includes(q)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned && sortBy !== "name") {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === "unread") {
        return b.unreadCount - a.unreadCount;
      }
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }

  async getConversationById(id: string): Promise<ConversationPreview | null> {
    const conversations = await this.getConversations("all");
    return conversations.find((c) => c.id === id) || null;
  }

  async togglePinConversation(id: string): Promise<ConversationPreview | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
      .from("conversation_members")
      .select("is_pinned")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) return null;

    const newPinned = !member.is_pinned;
    await supabase
      .from("conversation_members")
      .update({ is_pinned: newPinned, is_favorite: newPinned })
      .eq("conversation_id", id)
      .eq("user_id", user.id);

    return this.getConversationById(id);
  }

  async toggleMuteConversation(id: string): Promise<ConversationPreview | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
      .from("conversation_members")
      .select("is_muted")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member) return null;

    const newMuted = !member.is_muted;
    await supabase
      .from("conversation_members")
      .update({ is_muted: newMuted })
      .eq("conversation_id", id)
      .eq("user_id", user.id);

    return this.getConversationById(id);
  }
}
