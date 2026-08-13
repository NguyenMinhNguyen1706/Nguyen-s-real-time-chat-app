-- pgTAP RLS Security & Schema Test Suite
-- Project: Nguyen's Real-time Chat App

BEGIN;
SELECT plan(37);

-- Helper function to authenticate test user persistently
CREATE OR REPLACE FUNCTION authenticate_as(user_uuid text) RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', false);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_uuid, 'role', 'authenticated')::text, false);
  PERFORM set_config('request.jwt.claim.sub', user_uuid, false);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', false);
END;
$$ LANGUAGE plpgsql;

-- Helper function to reset to superuser postgres role for pgTAP assertions
CREATE OR REPLACE FUNCTION reset_auth() RETURNS void AS $$
BEGIN
  PERFORM set_config('role', 'postgres', false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SECTION 1: SCHEMA & TABLE STRUCTURE (7 tests)
-- ============================================================
SELECT has_table('profiles', 'profiles table exists');
SELECT has_table('conversations', 'conversations table exists');
SELECT has_table('conversation_members', 'conversation_members table exists');
SELECT has_table('messages', 'messages table exists');
SELECT has_table('message_reactions', 'message_reactions table exists');
SELECT has_table('message_attachments', 'message_attachments table exists');
SELECT has_table('notifications', 'notifications table exists');

-- ============================================================
-- SECTION 2: CONSTRAINTS & RLS STATUS (7 tests)
-- ============================================================
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''profiles'' AND relkind = ''r''', ARRAY[true], 'profiles RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''conversations'' AND relkind = ''r''', ARRAY[true], 'conversations RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''conversation_members'' AND relkind = ''r''', ARRAY[true], 'conversation_members RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''messages'' AND relkind = ''r''', ARRAY[true], 'messages RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''message_reactions'' AND relkind = ''r''', ARRAY[true], 'message_reactions RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''message_attachments'' AND relkind = ''r''', ARRAY[true], 'message_attachments RLS is enabled');
SELECT results_eq('SELECT relrowsecurity FROM pg_class WHERE relname = ''notifications'' AND relkind = ''r''', ARRAY[true], 'notifications RLS is enabled');

-- ============================================================
-- SECTION 3: PROFILES RLS POLICIES (4 tests)
-- ============================================================

-- P1: User A SELECT own profile -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT username FROM public.profiles WHERE id = ''00000000-0000-4000-a000-000000000001''',
  ARRAY['nguyenminhnguyen'],
  'P1: User A can read own profile'
);

-- P2: User A SELECT User B profile -> ALLOW (public profile fields)
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT username FROM public.profiles WHERE id = ''00000000-0000-4000-a000-000000000002''',
  ARRAY['sarahchen'],
  'P2: User A can read User B public profile fields'
);

-- P3: User A UPDATE own profile -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
UPDATE public.profiles SET bio = 'Updated by User A' WHERE id = '00000000-0000-4000-a000-000000000001';
SELECT results_eq(
  'SELECT bio FROM public.profiles WHERE id = ''00000000-0000-4000-a000-000000000001''',
  ARRAY['Updated by User A'],
  'P3: User A can update own profile'
);

-- P4: User A UPDATE User B profile -> DENY (0 rows updated)
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'WITH updated AS (UPDATE public.profiles SET bio = ''Hacked'' WHERE id = ''00000000-0000-4000-a000-000000000002'' RETURNING id) SELECT count(*)::int FROM updated',
  ARRAY[0],
  'P4: User A cannot update User B profile (0 rows affected)'
);

-- ============================================================
-- SECTION 4: CONVERSATIONS RLS POLICIES (4 tests)
-- ============================================================

-- C1: User A (member) SELECT Conversation 1 -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT id FROM public.conversations WHERE id = ''10000000-0000-4000-a000-000000000001''',
  ARRAY['10000000-0000-4000-a000-000000000001'::uuid],
  'C1: Member User A can read Conversation 1'
);

-- C2: User C (non-member) SELECT Conversation 1 -> DENY (0 rows returned)
SELECT authenticate_as('00000000-0000-4000-a000-000000000005');
SELECT is_empty(
  'SELECT id FROM public.conversations WHERE id = ''10000000-0000-4000-a000-000000000001''',
  'C2: Non-member User C sees 0 rows for Conversation 1'
);

-- C3: User A INSERT conversation as self (created_by = auth.uid()) -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
INSERT INTO public.conversations (id, type, title, created_by) VALUES ('50000000-0000-4000-a000-000000000001', 'group', 'Test Group', '00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT title FROM public.conversations WHERE id = ''50000000-0000-4000-a000-000000000001''',
  ARRAY['Test Group'],
  'C3: User A can create a conversation with created_by = self'
);

-- C4: User A INSERT conversation as User B (created_by = User B) -> DENY
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT throws_ok(
  'INSERT INTO public.conversations (id, type, title, created_by) VALUES (''50000000-0000-4000-a000-000000000002'', ''group'', ''Fake Group'', ''00000000-0000-4000-a000-000000000002'')',
  '42501',
  NULL,
  'C4: User A cannot create a conversation with created_by = User B'
);

-- ============================================================
-- SECTION 5: MEMBERSHIP & BOOTSTRAP RLS POLICIES (5 tests)
-- ============================================================

-- M1: Creator User A bootstrap self as owner in own newly created conversation -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES ('50000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'owner');
SELECT results_eq(
  'SELECT role::text FROM public.conversation_members WHERE conversation_id = ''50000000-0000-4000-a000-000000000001'' AND user_id = ''00000000-0000-4000-a000-000000000001''',
  ARRAY['owner'],
  'M1: Creator User A can bootstrap self as owner in own conversation'
);

-- M2: User C (non-creator) attempt arbitrary self-join into Conv 1 -> DENY
SELECT authenticate_as('00000000-0000-4000-a000-000000000005');
SELECT throws_ok(
  'INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES (''10000000-0000-4000-a000-000000000001'', ''00000000-0000-4000-a000-000000000005'', ''member'')',
  '42501',
  NULL,
  'M2: User C cannot self-join Conv 1 created by Sarah'
);

-- M3: Owner User A add User C to Conv 2 -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES ('10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000005', 'member');
SELECT results_eq(
  'SELECT role::text FROM public.conversation_members WHERE conversation_id = ''10000000-0000-4000-a000-000000000002'' AND user_id = ''00000000-0000-4000-a000-000000000005''',
  ARRAY['member'],
  'M3: Owner User A can add User C to Conv 2'
);

-- M4: User C attempt ROLE ESCALATION (member -> owner) -> DENY (RLS WITH CHECK throws 42501)
SELECT authenticate_as('00000000-0000-4000-a000-000000000005');
SELECT throws_ok(
  'UPDATE public.conversation_members SET role = ''owner'' WHERE user_id = ''00000000-0000-4000-a000-000000000005'' AND conversation_id = ''10000000-0000-4000-a000-000000000002''',
  '42501',
  NULL,
  'M4: Regular member User C cannot escalate role to owner'
);

-- M5: User C update own preference (is_pinned) without role change -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000005');
UPDATE public.conversation_members SET is_pinned = true WHERE user_id = '00000000-0000-4000-a000-000000000005' AND conversation_id = '10000000-0000-4000-a000-000000000002';
SELECT results_eq(
  'SELECT is_pinned FROM public.conversation_members WHERE user_id = ''00000000-0000-4000-a000-000000000005'' AND conversation_id = ''10000000-0000-4000-a000-000000000002''',
  ARRAY[true],
  'M5: Member User C can update own preferences (is_pinned)'
);

-- ============================================================
-- SECTION 6: MESSAGES RLS POLICIES (5 tests)
-- ============================================================

-- MS1: Member User A SELECT messages in Conv 1 -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT count(*)::int FROM public.messages WHERE conversation_id = ''10000000-0000-4000-a000-000000000001''',
  ARRAY[2],
  'MS1: Member User A can read messages in Conv 1'
);

-- MS2: Non-member User B SELECT messages in Conv 3 -> DENY (0 rows)
SELECT authenticate_as('00000000-0000-4000-a000-000000000002');
SELECT is_empty(
  'SELECT id FROM public.messages WHERE conversation_id = ''10000000-0000-4000-a000-000000000003''',
  'MS2: Non-member User B sees 0 messages in Conv 3'
);

-- MS3: Member User A INSERT message as self -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
INSERT INTO public.messages (id, conversation_id, sender_id, content) VALUES ('60000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'Test msg');
SELECT results_eq(
  'SELECT content FROM public.messages WHERE id = ''60000000-0000-4000-a000-000000000001''',
  ARRAY['Test msg'],
  'MS3: Member User A can insert message as self'
);

-- MS4: Member User A INSERT message pretending sender_id = User B -> DENY
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT throws_ok(
  'INSERT INTO public.messages (id, conversation_id, sender_id, content) VALUES (''60000000-0000-4000-a000-000000000002'', ''10000000-0000-4000-a000-000000000001'', ''00000000-0000-4000-a000-000000000002'', ''Fake msg'')',
  '42501',
  NULL,
  'MS4: User A cannot insert message pretending sender_id = User B'
);

-- MS5: User A UPDATE sender_id to impersonate User B on edit -> DENY (RLS WITH CHECK throws 42501)
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT throws_ok(
  'UPDATE public.messages SET sender_id = ''00000000-0000-4000-a000-000000000002'' WHERE id = ''60000000-0000-4000-a000-000000000001''',
  '42501',
  NULL,
  'MS5: User A cannot mutate sender_id to impersonate User B'
);

-- ============================================================
-- SECTION 7: REACTIONS, ATTACHMENTS, NOTIFICATIONS (5 tests)
-- ============================================================

-- R1: Member User A INSERT reaction to message in own chat -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
INSERT INTO public.message_reactions (message_id, user_id, emoji) VALUES ('20000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', '👍');
SELECT results_eq(
  'SELECT emoji::text FROM public.message_reactions WHERE message_id = ''20000000-0000-4000-a000-000000000001'' AND user_id = ''00000000-0000-4000-a000-000000000001'' AND emoji = ''👍''',
  ARRAY['👍'],
  'R1: Member User A can react to message in Conv 1'
);

-- R2: User A DELETE User B reaction -> DENY (0 rows deleted)
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'WITH deleted AS (DELETE FROM public.message_reactions WHERE message_id = ''20000000-0000-4000-a000-000000000001'' AND user_id = ''00000000-0000-4000-a000-000000000002'' RETURNING id) SELECT count(*)::int FROM deleted',
  ARRAY[0],
  'R2: User A cannot delete User B reaction'
);

-- A1: Non-member User B SELECT attachment in Conv 3 -> DENY (0 rows)
SELECT authenticate_as('00000000-0000-4000-a000-000000000002');
SELECT is_empty(
  'SELECT id FROM public.message_attachments WHERE message_id IN (SELECT id FROM public.messages WHERE conversation_id = ''10000000-0000-4000-a000-000000000003'')',
  'A1: Non-member User B cannot read attachments in Conv 3'
);

-- N1: User A SELECT own notifications -> ALLOW
SELECT authenticate_as('00000000-0000-4000-a000-000000000001');
SELECT results_eq(
  'SELECT count(*)::int FROM public.notifications WHERE user_id = ''00000000-0000-4000-a000-000000000001''',
  ARRAY[0],
  'N1: User A can read own notifications'
);

-- N2: User B SELECT User A notifications -> DENY (0 rows)
SELECT authenticate_as('00000000-0000-4000-a000-000000000002');
SELECT is_empty(
  'SELECT id FROM public.notifications WHERE user_id = ''00000000-0000-4000-a000-000000000001''',
  'N2: User B cannot read User A notifications'
);

SELECT * FROM finish();
ROLLBACK;
