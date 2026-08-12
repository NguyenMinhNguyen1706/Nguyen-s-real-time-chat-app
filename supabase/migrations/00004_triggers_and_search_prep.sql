-- Migration 00004: Automatic updated_at Trigger + Search Preparation
-- Project: Nguyen's Real-time Chat App

-- 1. Create a reusable trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach trigger to tables with updated_at column
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Search Preparation Notes (NOT IMPLEMENTED YET)
-- Future PostgreSQL full-text search options:
--   A. pg_trgm extension with GIN index on messages.content for LIKE/ILIKE queries
--   B. tsvector column on messages with GIN index for full-text search
--   C. Supabase Full Text Search via .textSearch() client method
-- Decision deferred until search backend integration task.
-- Current search operates entirely on frontend mock data.

COMMENT ON TABLE public.messages IS 'Future search: consider adding tsvector column with GIN index for PostgreSQL full-text search on content field.';
