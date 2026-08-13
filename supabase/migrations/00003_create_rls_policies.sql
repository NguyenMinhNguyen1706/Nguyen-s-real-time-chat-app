-- Migration 00003: Row Level Security (RLS) Policies & Helper Functions
-- Project: Nguyen's Real-time Chat App
-- HARDENED in TASK 11.3: SECURITY DEFINER membership & creator helpers (prevents RLS recursion & bootstrap catch-22), strict bootstrap, anti-role-escalation.

-- Enable RLS on all 7 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants for API Roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ----------------------------------------------------
-- SECURITY DEFINER RLS HELPER FUNCTIONS
-- Eliminates RLS subquery recursion and bootstrap catch-22
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_owner_or_admin(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
    AND role IN ('owner', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_creator(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = p_conversation_id
    AND created_by = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_member(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_conversation_owner_or_admin(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_conversation_creator(UUID, UUID) TO authenticated, service_role;

-- ----------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- CONVERSATIONS POLICIES
-- ----------------------------------------------------
-- Creator or member can view conversation
CREATE POLICY "Conversations viewable by members or creator"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_conversation_member(id, auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can update conversation metadata"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (public.is_conversation_member(id, auth.uid()))
  WITH CHECK (public.is_conversation_member(id, auth.uid()));

-- ----------------------------------------------------
-- CONVERSATION MEMBERS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Conversation members viewable by members"
  ON public.conversation_members FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));

-- BOOTSTRAP & INSERT POLICY:
-- CASE A: Creator bootstrapping their own membership as owner
-- CASE B: Existing owner/admin adding another user to the conversation
CREATE POLICY "Creator bootstrap or owner/admin add members"
  ON public.conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      auth.uid() = user_id
      AND role = 'owner'
      AND public.is_conversation_creator(conversation_id, auth.uid())
    )
    OR
    public.is_conversation_owner_or_admin(conversation_id, auth.uid())
  );

-- UPDATE POLICY (ANTI-ROLE-ESCALATION):
-- User updating own row cannot change role; owner can manage roles.
CREATE POLICY "Users update own preferences or owners manage roles"
  ON public.conversation_members FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_conversation_owner_or_admin(conversation_id, auth.uid())
  )
  WITH CHECK (
    (
      auth.uid() = user_id
      AND role = (
        SELECT cm.role FROM public.conversation_members cm
        WHERE cm.id = conversation_members.id
      )
    )
    OR
    public.is_conversation_owner_or_admin(conversation_id, auth.uid())
  );

CREATE POLICY "Members can leave or admins can remove members"
  ON public.conversation_members FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_conversation_owner_or_admin(conversation_id, auth.uid())
  );

-- ----------------------------------------------------
-- MESSAGES POLICIES
-- ----------------------------------------------------
CREATE POLICY "Messages viewable by conversation members"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Members can insert messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_member(conversation_id, auth.uid())
  );

CREATE POLICY "Sender can edit their own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_member(conversation_id, auth.uid())
  );

CREATE POLICY "Sender can delete their own messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- ----------------------------------------------------
-- MESSAGE REACTIONS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Reactions viewable by conversation members"
  ON public.message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND public.is_conversation_member(messages.conversation_id, auth.uid())
    )
  );

CREATE POLICY "Users can add reactions"
  ON public.message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND public.is_conversation_member(messages.conversation_id, auth.uid())
    )
  );

CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- MESSAGE ATTACHMENTS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Attachments viewable by conversation members"
  ON public.message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND public.is_conversation_member(messages.conversation_id, auth.uid())
    )
  );

CREATE POLICY "Members can insert message attachments"
  ON public.message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND public.is_conversation_member(messages.conversation_id, auth.uid())
    )
  );

-- ----------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Notifications viewable by recipient"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
