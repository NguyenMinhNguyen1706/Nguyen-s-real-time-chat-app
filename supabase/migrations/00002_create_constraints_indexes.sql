-- Migration 00002: Create Constraints and Performance Indexes
-- Project: Nguyen's Real-time Chat App

-- 1. Unique Constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_key UNIQUE (username);

ALTER TABLE public.conversation_members
  ADD CONSTRAINT conversation_members_convo_user_key UNIQUE (conversation_id, user_id);

ALTER TABLE public.message_reactions
  ADD CONSTRAINT message_reactions_unique_user_emoji UNIQUE (message_id, user_id, emoji);

-- 2. Value Constraints
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_type_check CHECK (type IN ('direct', 'group'));

ALTER TABLE public.conversation_members
  ADD CONSTRAINT conversation_members_role_check CHECK (role IN ('owner', 'admin', 'member'));

ALTER TABLE public.profiles
  ADD CONSTRAINT presence_status_check CHECK (presence_status IN ('online', 'offline', 'away', 'busy'));

ALTER TABLE public.message_attachments
  ADD CONSTRAINT attachment_file_size_check CHECK (file_size >= 0);

-- 3. Performance Indexes
-- Access Pattern 1: Fetch messages for a conversation ordered by time
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at DESC);

-- Access Pattern 2: Fetch all conversations a user belongs to
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_convo
  ON public.conversation_members (user_id, conversation_id);

-- Access Pattern 3: Fetch all participants of a conversation
CREATE INDEX IF NOT EXISTS idx_conversation_members_convo_user
  ON public.conversation_members (conversation_id, user_id);

-- Access Pattern 4: Fetch reactions for a specific message
CREATE INDEX IF NOT EXISTS idx_message_reactions_message
  ON public.message_reactions (message_id);

-- Access Pattern 5: Fetch unread notifications for a user ordered by time
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- Access Pattern 6: Username lookup during user search
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username);
