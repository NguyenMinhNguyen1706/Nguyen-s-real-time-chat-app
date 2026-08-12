-- Seed Data for Local Supabase Development
-- Project: Nguyen's Real-time Chat App
--
-- IMPORTANT: This file is NOT a migration. It is a seed script.
-- Run via: supabase db seed (automatically runs supabase/seed.sql)
-- or manually: psql $SUPABASE_DB_URL -f supabase/seed.sql
--
-- Seed data requires auth.users to exist first (profiles.id FK -> auth.users.id).
-- In local Supabase, we bootstrap test users into auth.users, then create profiles.
-- In production, profiles are created by the signup trigger — never by seed.

-- 1. Bootstrap test users into auth.users (local development only)
-- These use deterministic UUIDs for reproducible testing.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nguyen@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alex@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elena@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-4000-a000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'david@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required by Supabase Auth for email login)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', '{"sub":"00000000-0000-4000-a000-000000000001","email":"nguyen@example.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', '{"sub":"00000000-0000-4000-a000-000000000002","email":"sarah@example.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000003', '{"sub":"00000000-0000-4000-a000-000000000003","email":"alex@example.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-a000-000000000004', '00000000-0000-4000-a000-000000000004', '{"sub":"00000000-0000-4000-a000-000000000004","email":"elena@example.com"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4000-a000-000000000005', '00000000-0000-4000-a000-000000000005', '{"sub":"00000000-0000-4000-a000-000000000005","email":"david@example.com"}', 'email', now(), now(), now())
ON CONFLICT ON CONSTRAINT identities_pkey DO NOTHING;

-- 2. Insert Test Profiles
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

-- 3. Insert Direct and Group Conversations
INSERT INTO public.conversations (id, type, title, created_by)
VALUES
  ('10000000-0000-4000-a000-000000000001', 'direct', NULL, '00000000-0000-4000-a000-000000000002'),
  ('10000000-0000-4000-a000-000000000002', 'group', 'Frontend Engineering Team', '00000000-0000-4000-a000-000000000001'),
  ('10000000-0000-4000-a000-000000000003', 'direct', NULL, '00000000-0000-4000-a000-000000000003'),
  ('10000000-0000-4000-a000-000000000004', 'group', 'UI/UX Design Studio', '00000000-0000-4000-a000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Conversation Memberships
INSERT INTO public.conversation_members (conversation_id, user_id, role, is_pinned, is_favorite)
VALUES
  -- Conversation 1: Nguyen <-> Sarah (direct)
  ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'member', true, true),
  ('10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'member', false, true),

  -- Conversation 2: Frontend Engineering Team (group, Nguyen=owner)
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000001', 'owner', true, true),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'admin', false, true),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000003', 'member', false, false),
  ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000004', 'member', false, false),

  -- Conversation 3: Nguyen <-> Alex (direct)
  ('10000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000001', 'member', false, false),
  ('10000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000003', 'member', false, false),

  -- Conversation 4: UI/UX Design Studio (group, Sarah=owner)
  ('10000000-0000-4000-a000-000000000004', '00000000-0000-4000-a000-000000000002', 'owner', false, false),
  ('10000000-0000-4000-a000-000000000004', '00000000-0000-4000-a000-000000000004', 'member', false, false)
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- 5. Insert Messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'Hey Nguyen! The frontend release candidate build passed 100% of quality gates.', now() - interval '30 minutes'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'Awesome! We are now initializing TASK 11 Supabase backend foundation.', now() - interval '25 minutes'),
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000001', 'Team, the database schema migration is ready for review.', now() - interval '15 minutes'),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000003', 'On it! Let me check the RLS policies.', now() - interval '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert a reply
INSERT INTO public.messages (id, conversation_id, sender_id, content, reply_to_message_id, created_at)
VALUES
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'Looks solid! Approved from design side.', '20000000-0000-4000-a000-000000000003', now() - interval '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Message Reactions
INSERT INTO public.message_reactions (message_id, user_id, emoji)
VALUES
  ('20000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', '❤️'),
  ('20000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', '🔥'),
  ('20000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000003', '👍'),
  ('20000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000002', '✅')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

-- 8. Insert Attachment Metadata (no actual file upload)
INSERT INTO public.message_attachments (id, message_id, storage_path, file_name, mime_type, file_size)
VALUES
  ('30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 'chat-attachments/schema-diagram.png', 'schema-diagram.png', 'image/png', 245760)
ON CONFLICT (id) DO NOTHING;
