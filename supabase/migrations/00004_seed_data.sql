-- Migration 00004: Seed Data for Local Development
-- Project: Nguyen's Real-time Chat App

-- Note: In local Supabase development, UUIDs are deterministic for testing.

-- 1. Insert Test Profiles (auth.users inserts omitted, mock UUIDs mapped directly for schema validation)
INSERT INTO public.profiles (id, display_name, username, avatar_path, bio, presence_status, custom_status)
VALUES
  ('00000000-0000-4000-a000-000000000001', 'Nguyen Minh Nguyen', 'nguyenminhnguyen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nguyen', 'Lead Software Architect & Engineer', 'online', 'Building real-time chat app'),
  ('00000000-0000-4000-a000-000000000002', 'Sarah Chen', 'sarahchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'Product Designer & UI Lead', 'online', 'Reviewing component specs'),
  ('00000000-0000-4000-a000-000000000003', 'Alex Rivers', 'alexrivers', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'Senior Full-Stack Engineer', 'away', 'In deep focus mode'),
  ('00000000-0000-4000-a000-000000000004', 'Elena Rostova', 'elenarostova', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', 'QA & Performance Specialist', 'busy', 'Running regression tests'),
  ('00000000-0000-4000-a000-000000000005', 'David Kim', 'davidkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 'DevOps & Cloud Engineer', 'offline', 'Out of office')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  presence_status = EXCLUDED.presence_status;

-- 2. Insert Direct and Group Conversations
INSERT INTO public.conversations (id, type, title, created_by)
VALUES
  ('10000000-0000-4000-a000-000000000001', 'direct', NULL, '00000000-0000-4000-a000-000000000002'),
  ('10000000-0000-4000-a000-000000000002', 'group', 'Frontend Engineering Team', '00000000-0000-4000-a000-000000000001'),
  ('10000000-0000-4000-a000-000000000003', 'direct', NULL, '00000000-0000-4000-a000-000000000003'),
  ('10000000-0000-4000-a000-000000000004', 'group', 'UI/UX Design Studio', '00000000-0000-4000-a000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Conversation Memberships
INSERT INTO public.conversation_members (conversation_id, user_id, role, is_pinned, is_favorite)
VALUES
  -- Sarah Direct Chat
  ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'member', true, true),
  ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'member', false, true),

  -- Frontend Group Chat
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000001', 'owner', true, true),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'admin', false, true),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000003', 'member', false, false),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000004', 'member', false, false)
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- 4. Insert Messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'Hey Nguyen! The frontend release candidate build passed 100% of quality gates.', now() - interval '30 minutes'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'Awesome! We are now initializing TASK 11 Supabase backend foundation.', now() - interval '25 minutes')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Message Reactions
INSERT INTO public.message_reactions (message_id, user_id, emoji)
VALUES
  ('20000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', '❤️'),
  ('20000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', '🔥')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;
