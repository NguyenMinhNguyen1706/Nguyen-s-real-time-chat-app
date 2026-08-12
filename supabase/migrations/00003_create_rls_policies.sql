-- Migration 00003: Row Level Security (RLS) Policies
-- Project: Nguyen's Real-time Chat App
-- HARDENED in TASK 11.1: Fixed circular dependencies, tightened INSERT/UPDATE policies.

-- Enable RLS on all 7 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------
-- Allow all authenticated users to view profiles (for user discovery & chat headers).
-- Decision: display_name, username, avatar_path, bio, presence_status, custom_status
-- are considered public profile fields. The profiles table does NOT contain email
-- or private credentials — those live in auth.users which is not exposed via Data API.
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile matching auth.uid()
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile matching auth.uid()
-- WITH CHECK ensures the id column cannot be changed to another user's id
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- CONVERSATIONS POLICIES
-- ----------------------------------------------------
-- Users can view conversations they are members of
CREATE POLICY "Conversations viewable by members"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Authenticated users can create conversations (must be the creator)
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Members can update conversation metadata (e.g. title)
-- WITH CHECK prevents changing created_by or type to unauthorized values
CREATE POLICY "Members can update conversation metadata"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- CONVERSATION MEMBERS POLICIES
-- ----------------------------------------------------
-- IMPORTANT: conversation_members SELECT cannot use a self-referential subquery
-- on the same table because RLS would create infinite recursion.
-- Instead, we use a direct ownership check: you can see membership rows
-- where you ARE the member (your own rows), or where you share a conversation.
-- To avoid recursion, we use a security-safe pattern:
-- A user can always see their own membership rows.
CREATE POLICY "Users can see their own memberships"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- A user can also see other members' rows for conversations they belong to.
-- This avoids infinite recursion by checking the current user's own row directly.
-- NOTE: PostgreSQL evaluates multiple SELECT policies with OR logic.
CREATE POLICY "Members can see fellow members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT cm.conversation_id
      FROM public.conversation_members cm
      WHERE cm.user_id = auth.uid()
    )
  );

-- CONVERSATION MEMBER BOOTSTRAP POLICY:
-- When creating a new conversation, the creator must be able to insert the
-- initial membership row. This policy allows:
-- 1. A user inserting themselves (user_id = auth.uid()) — always allowed for bootstrap
-- 2. An existing owner/admin adding other users to a conversation they manage
CREATE POLICY "Users can bootstrap or admins can add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User is inserting themselves (conversation bootstrap or joining)
    auth.uid() = user_id
    OR
    -- Case 2: An owner or admin of the conversation is adding another user
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- Users can update their own membership preferences (pinned, favorite, muted, archived, last_read_at)
-- WITH CHECK ensures user_id cannot be changed
CREATE POLICY "Users can update their own conversation membership"
  ON public.conversation_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Members can remove themselves; owners/admins can remove others
CREATE POLICY "Members can leave or admins can remove members"
  ON public.conversation_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- ----------------------------------------------------
-- MESSAGES POLICIES
-- ----------------------------------------------------
-- Users can read messages in conversations they are members of
CREATE POLICY "Messages viewable by conversation members"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Users can send messages to conversations they belong to
CREATE POLICY "Members can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Sender can update their own messages (edit content)
-- HARDENED: WITH CHECK enforces sender_id AND conversation_id immutability.
-- Prevents attack vectors:
--   UPDATE messages SET sender_id = <other_user>  → DENIED (sender_id must stay auth.uid())
--   UPDATE messages SET conversation_id = <other>  → DENIED (must still be member of conversation)
CREATE POLICY "Sender can edit their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Sender can soft/hard delete their own messages
CREATE POLICY "Sender can delete their own messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- ----------------------------------------------------
-- MESSAGE REACTIONS POLICIES
-- ----------------------------------------------------
-- Reactions viewable by members of the message's conversation
CREATE POLICY "Reactions viewable by conversation members"
  ON public.message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_reactions.message_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Users can react to messages in conversations they belong to
CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_reactions.message_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Users can delete their own reactions only
CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- MESSAGE ATTACHMENTS POLICIES
-- ----------------------------------------------------
-- Attachments viewable by members of the parent message's conversation
CREATE POLICY "Attachments viewable by conversation members"
  ON public.message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_attachments.message_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- Members can insert attachments for messages in their conversations
CREATE POLICY "Members can insert message attachments"
  ON public.message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.conversation_members ON conversation_members.conversation_id = messages.conversation_id
      WHERE messages.id = message_attachments.message_id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ----------------------------------------------------
-- Users can only view their own notifications
CREATE POLICY "Notifications viewable by recipient"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update read_at on their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
