-- Migration 00006: Enable Supabase Realtime Publication for Messages
-- Project: Nguyen's Real-time Chat App

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
