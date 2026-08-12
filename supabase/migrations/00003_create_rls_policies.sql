-- Migration 00003: Row Level Security (RLS) Policies
-- Project: Nguyen's Real-time Chat App

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
-- Allow all authenticated users to view profiles (for user discovery & chat headers)
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

-- Authenticated users can create conversations
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Members can update conversation metadata
CREATE POLICY "Members can update conversation metadata"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- CONVERSATION MEMBERS POLICIES
-- ----------------------------------------------------
-- Members can view membership list for conversations they belong to
CREATE POLICY "Conversation members viewable by fellow members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members AS cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.user_id = auth.uid()
    )
  );

-- Users can insert themselves as a member or admins can add members
CREATE POLICY "Users can insert conversation members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Users can update their own membership preferences (pinned, favorite, muted, archived, last_read_at)
CREATE POLICY "Users can update their own conversation membership"
  ON public.conversation_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Sender can edit their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

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

-- Users can delete their own reactions
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

-- Members can insert attachments for their messages
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
