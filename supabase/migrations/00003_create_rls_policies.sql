-- Migration 00003: Row Level Security (RLS) Policies
-- Project: Nguyen's Real-time Chat App
-- HARDENED in TASK 11.2: Strict creator self-bootstrap, anti-arbitrary-self-join, anti-role-escalation.

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
-- are public profile fields. Private credentials/emails live exclusively in auth.users.
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
-- Prevents User A creating a conversation with created_by = User B
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
-- Non-recursive SELECT policies for conversation membership:
-- 1. A user can see their own membership rows directly.
CREATE POLICY "Users can see their own memberships"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. A user can see fellow members' rows for conversations they belong to.
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

-- CONVERSATION MEMBER BOOTSTRAP & INSERT POLICY (HARDENED IN TASK 11.2):
-- Prevents arbitrary self-joining of existing conversations created by others.
-- Allowed cases:
--   CASE A (Creator Self-Bootstrap): User is inserting themselves (user_id = auth.uid())
--          INTO a conversation created by themselves (conversations.created_by = auth.uid()),
--          AND role must be 'owner'.
--   CASE B (Owner/Admin Member Addition): User has owner or admin role in target conversation.
CREATE POLICY "Creator bootstrap or owner/admin add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- CASE A: Creator bootstrapping their own membership as owner
    (
      auth.uid() = user_id
      AND role = 'owner'
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_members.conversation_id
        AND c.created_by = auth.uid()
      )
    )
    OR
    -- CASE B: Existing owner/admin adding another user to their conversation
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

-- CONVERSATION MEMBER UPDATE POLICY (HARDENED IN TASK 11.2 - ANTI ROLE ESCALATION):
-- Prevents regular members from escalating their role (e.g. member -> owner/admin).
-- Allowed cases:
--   CASE A: User updating own preferences (is_favorite, is_pinned, is_muted, is_archived, last_read_at)
--          WITHOUT changing role.
--   CASE B: Existing owner updating member role.
CREATE POLICY "Users update own preferences or owners manage roles"
  ON public.conversation_members FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  )
  WITH CHECK (
    -- User updating own row cannot change role
    (
      auth.uid() = user_id
      AND role = (
        SELECT cm.role FROM public.conversation_members cm
        WHERE cm.id = conversation_members.id
      )
    )
    OR
    -- Owner managing member roles
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'owner'
    )
  );

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
-- WITH CHECK enforces sender_id AND conversation_id immutability.
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
