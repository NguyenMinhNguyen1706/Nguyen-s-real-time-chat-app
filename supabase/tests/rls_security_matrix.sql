-- RLS Security Validation Test Script (HARDENED TASK 11.2)
-- Run after seeding local Supabase: psql $SUPABASE_DB_URL -f supabase/tests/rls_security_matrix.sql
--
-- Test Users:
--   User A (Nguyen): 00000000-0000-4000-a000-000000000001
--     - Creator/Owner of Conversation 2 (Frontend Engineering Team)
--     - Member of Conversation 1 (direct with Sarah)
--     - NOT creator nor member of Conversation 4 (UI/UX Studio, created by Sarah)
--   User B (Sarah): 00000000-0000-4000-a000-000000000002
--     - Creator/Owner of Conversation 1 & 4
--   User C (David): 00000000-0000-4000-a000-000000000005
--     - Observer / non-member of Conversation 4

-- =================== PROFILES ===================
-- P1: User A SELECT own profile → ALLOW
-- P2: User A SELECT User B profile → ALLOW (public profile fields: display_name, username, avatar, bio, presence)
-- P3: User A UPDATE own profile → ALLOW
-- P4: User A UPDATE User B profile → DENY (auth.uid() != id)

-- =================== CONVERSATIONS ===================
-- C1: User A INSERT conversation with created_by = User A → ALLOW
-- C2: User A INSERT conversation with created_by = User B → DENY (auth.uid() != created_by)
-- C3: User A SELECT Conversation 1 (member) → ALLOW
-- C4: User C SELECT Conversation 1 (not member) → DENY (0 rows returned)
-- C5: User A UPDATE Conversation 1 title (member) → ALLOW
-- C6: User C UPDATE Conversation 1 title (not member) → DENY

-- =================== CONVERSATION MEMBERS (HARDENED TASK 11.2) ===================
-- M1: User A create new conversation Conv5 (created_by=User A) AND bootstrap self as owner → ALLOW
--     INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ('<Conv5_ID>', '00000000-0000-4000-a000-000000000001', 'owner');
--     Result: ALLOW (auth.uid() = user_id AND role = 'owner' AND conversations.created_by = auth.uid())

-- M2: User C attempt self-join into Conversation 4 (created by Sarah) → DENY
--     SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-4000-a000-000000000005","role":"authenticated"}';
--     INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ('10000000-0000-4000-a000-000000000004', '00000000-0000-4000-a000-000000000005', 'member');
--     Result: DENIED (User C is NOT creator of Conv 4 AND not added by Conv 4 owner/admin)

-- M3: User B (owner of Conv 4) add User C to Conv 4 → ALLOW
--     SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-4000-a000-000000000002","role":"authenticated"}';
--     INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ('10000000-0000-4000-a000-000000000004', '00000000-0000-4000-a000-000000000005', 'member');
--     Result: ALLOW (User B is owner of Conv 4)

-- M4: User C (regular member of Conv 2) attempt ROLE ESCALATION (member -> owner) → DENY
--     SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-4000-a000-000000000005","role":"authenticated"}';
--     UPDATE conversation_members SET role = 'owner' WHERE user_id = '00000000-0000-4000-a000-000000000005';
--     Result: DENIED (WITH CHECK enforces role matches original role unless updated by owner)

-- M5: User C update own preferences (is_pinned = true) without role change → ALLOW
--     UPDATE conversation_members SET is_pinned = true WHERE user_id = '00000000-0000-4000-a000-000000000005';
--     Result: ALLOW

-- M6: User C leave conversation (DELETE own row) → ALLOW
-- M7: User C DELETE User A's membership row → DENY (User C is not owner/admin)

-- =================== MESSAGES ===================
-- MS1: Member SELECT messages → ALLOW
-- MS2: Non-member SELECT messages → DENY
-- MS3: Member INSERT message as self → ALLOW
-- MS4: Member INSERT message pretending sender_id = other → DENY (auth.uid() != sender_id)
-- MS5: Sender UPDATE own message content → ALLOW
-- MS6: ATTACK: Sender UPDATE sender_id to impersonate other → DENY (WITH CHECK: sender_id must stay auth.uid())
-- MS7: ATTACK: Sender UPDATE conversation_id to migrate message → DENY (WITH CHECK: target conversation member check)
-- MS8: User B UPDATE User A message → DENY
-- MS9: Sender DELETE own message → ALLOW
-- MS10: User B DELETE User A message → DENY

-- =================== REACTIONS ===================
-- R1: Member INSERT own reaction → ALLOW
-- R2: Duplicate reaction (message_id, user_id, emoji) → DENY (UNIQUE constraint)
-- R3: User DELETE own reaction → ALLOW
-- R4: User DELETE other's reaction → DENY

-- =================== ATTACHMENTS ===================
-- A1: Member SELECT attachments → ALLOW
-- A2: Non-member SELECT attachments → DENY

-- =================== NOTIFICATIONS ===================
-- N1: Recipient SELECT own notifications → ALLOW
-- N2: Other user SELECT notifications → DENY
-- N3: Recipient UPDATE read_at → ALLOW
-- N4: Other user UPDATE read_at → DENY
