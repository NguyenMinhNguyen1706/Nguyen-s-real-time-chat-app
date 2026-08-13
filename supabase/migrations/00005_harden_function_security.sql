-- Migration 00005: Security Hardening for Helper & Trigger Functions
-- Project: Nguyen's Real-time Chat App
-- Resolves Supabase Security Advisor warnings:
-- 1. Fixed mutable search_path on handle_updated_at() trigger function
-- 2. Secured SECURITY DEFINER helper functions with SET search_path = '' and REVOKE EXECUTE FROM PUBLIC/anon

-- 1. Harden handle_updated_at trigger function search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

-- 2. Harden SECURITY DEFINER helper function: is_conversation_member
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_conversation_member(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_conversation_member(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_member(UUID, UUID) TO authenticated, service_role;

-- 3. Harden SECURITY DEFINER helper function: is_conversation_owner_or_admin
CREATE OR REPLACE FUNCTION public.is_conversation_owner_or_admin(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
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

REVOKE EXECUTE ON FUNCTION public.is_conversation_owner_or_admin(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_conversation_owner_or_admin(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_owner_or_admin(UUID, UUID) TO authenticated, service_role;

-- 4. Harden SECURITY DEFINER helper function: is_conversation_creator
CREATE OR REPLACE FUNCTION public.is_conversation_creator(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = p_conversation_id
    AND created_by = p_user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_conversation_creator(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_conversation_creator(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_creator(UUID, UUID) TO authenticated, service_role;
