# Supabase Database Schema & Architecture Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Engine**: PostgreSQL 17 (Supabase)  
**Migration Version**: `00001` through `00004`  
**RLS Hardened & Finalized**: TASK 11.3  
**Runtime Validation**: **PASS** (37 / 37 pgTAP database security assertions passed)

---

## 1. Overview & ER Architecture

```
                      +-------------------+
                      |    auth.users     |
                      +---------+---------+
                                |
                                v (1:1, ON DELETE CASCADE)
                      +---------+---------+
                      |  public.profiles  |
                      +----+---------+----+
                           |         |
         (created_by)      |         | (user_id)
      +--------------------+         +-----------------------+
      |                                                      |
      v                                                      v
+-----+------------------+                         +---------+------------+
|   public.conversations |                         | conversation_members |
+-----------+------------+                         +---------+------------+
            |                                                |
            | (1:N)                                          |
            v                                                |
+-----------+------------+                                   |
|    public.messages     |<----------------------------------+
+-----+------------+-----+  (membership validation via RLS)
      |            |
      v (1:N)      v (1:N)
+-----+----+  +----+-------------+
|reactions |  |  attachments     |
+----------+  +------------------+

+------------------+
| notifications    | (user_id → profiles.id)
+------------------+
```

---

## 2. Table Specifications

### `public.profiles`
Stores extended user profile information linked 1:1 with `auth.users.id`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, FK → `auth.users.id` ON DELETE CASCADE | |
| `display_name` | TEXT | NOT NULL | |
| `username` | TEXT | NOT NULL, UNIQUE | |
| `avatar_path` | TEXT | Nullable | Storage path or external URL |
| `bio` | TEXT | Nullable | |
| `presence_status` | VARCHAR(20) | NOT NULL, DEFAULT `'online'`, CHECK `(online\|offline\|away\|busy)` | |
| `custom_status` | VARCHAR(50) | Nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger | |

**Privacy Decision**: `display_name`, `username`, `avatar_path`, `bio`, `presence_status`, and `custom_status` are public profile fields accessible to authenticated users for contact discovery and chat headers. Private credentials and email addresses reside exclusively in `auth.users`, which is strictly protected by Supabase Auth and never exposed via the Data API.

### `public.conversations`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `type` | VARCHAR(20) | NOT NULL, DEFAULT `'direct'`, CHECK `(direct\|group)` | |
| `title` | TEXT | Nullable | NULL for direct chats |
| `created_by` | UUID | FK → `profiles.id` ON DELETE SET NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger | |

### `public.conversation_members`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `conversation_id` | UUID | NOT NULL, FK → `conversations.id` ON DELETE CASCADE | |
| `user_id` | UUID | NOT NULL, FK → `profiles.id` ON DELETE CASCADE | |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `'member'`, CHECK `(owner\|admin\|member)` | |
| `is_favorite` | BOOLEAN | NOT NULL, DEFAULT `false` | |
| `is_pinned` | BOOLEAN | NOT NULL, DEFAULT `false` | |
| `is_muted` | BOOLEAN | NOT NULL, DEFAULT `false` | |
| `is_archived` | BOOLEAN | NOT NULL, DEFAULT `false` | |
| `last_read_at` | TIMESTAMPTZ | Nullable | Read position cursor |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | |

**Constraint**: `UNIQUE(conversation_id, user_id)` — prevents duplicate membership.

### `public.messages`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `conversation_id` | UUID | NOT NULL, FK → `conversations.id` ON DELETE CASCADE | |
| `sender_id` | UUID | NOT NULL, FK → `profiles.id` ON DELETE CASCADE | |
| `content` | TEXT | NOT NULL | Plain text only |
| `reply_to_message_id` | UUID | FK → `messages.id` ON DELETE SET NULL | |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `'sent'` | Persistent DB state |
| `is_edited` | BOOLEAN | NOT NULL, DEFAULT `false` | |
| `edited_at` | TIMESTAMPTZ | Nullable | |
| `deleted_at` | TIMESTAMPTZ | Nullable | Soft deletion |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger | |

---

## 3. Final Bootstrap & Membership Authorization Model

In TASK 11.2 & 11.3, conversation membership insertion and update rules were hardened with SECURITY DEFINER helper functions to eliminate RLS recursion and bootstrap catch-22:

1. **Creator Self-Bootstrap**: When a user creates a new conversation (`conversations.created_by = auth.uid()`), they are allowed to insert their own membership row as `owner` (`user_id = auth.uid() AND role = 'owner'`). Verified via `public.is_conversation_creator(conversation_id, auth.uid())`.
2. **Owner/Admin Member Addition**: Owners or admins of a conversation can add other users to that conversation. Verified via `public.is_conversation_owner_or_admin(conversation_id, auth.uid())`.
3. **Arbitrary Self-Join Prevention**: Arbitrary authenticated users CANNOT insert themselves into existing conversations created by others.
4. **Anti-Role-Escalation**: Regular members updating their membership preferences (`is_pinned`, `is_favorite`, `is_muted`, `is_archived`, `last_read_at`) are prohibited from escalating their `role` column via a strict `WITH CHECK` comparison against the existing row.

---

## 4. Row Level Security (RLS) Policy Summary

All 7 tables have `ENABLE ROW LEVEL SECURITY`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | All authenticated | Own id | Own id | — |
| `conversations` | Members or Creator | Creator (`created_by = auth.uid()`) | Members only | — |
| `conversation_members` | Members only | Creator bootstrap OR owner/admin add | Own prefs (no role change) OR owner role manage | Self leave OR owner/admin remove |
| `messages` | Members only | Sender + member | Sender + member (`sender_id` & `convo_id` immutable) | Sender only |
| `message_reactions` | Members only | Member + own `user_id` | — | Own `user_id` only |
| `message_attachments` | Members only | Member only | — | — |
| `notifications` | Recipient only | System/Server | Recipient only (`read_at`) | — |

---

## 5. Runtime Validation

- **Environment**: Docker Desktop 29.6.1 (Linux Engine on WSL2)
- **Supabase CLI Version**: 2.114.0
- **Local Database Stack**: PostgreSQL 17.6 (PostgREST + Auth + Storage + Studio)
- **Migration Repeatability**: Verified clean execution of `npx supabase db reset` across 2 consecutive runs
- **Schema Result**: All 7 tables (`profiles`, `conversations`, `conversation_members`, `messages`, `message_reactions`, `message_attachments`, `notifications`) verified with primary keys, foreign keys, unique constraints, check constraints, indexes, and active RLS.
- **pgTAP Test Suite Execution**: `npx supabase test db`
- **Executed Test Count**: **37 total subtests**
- **Test Result**: **37 PASSED / 0 FAILED** (`Result: PASS`)

### Security Matrix Test Summary (37 Executed Subtests)

| Section | Assertions | Result | Notes |
|---|---|---|---|
| **1. Table Structure** | 7 | 7 / 7 PASS | All 7 tables present in `public` schema |
| **2. RLS Status** | 7 | 7 / 7 PASS | `relrowsecurity = true` verified on all 7 tables |
| **3. Profiles RLS** | 4 | 4 / 4 PASS | Own read, public read, own edit ALLOW; other edit DENIED (0 rows affected) |
| **4. Conversations RLS** | 4 | 4 / 4 PASS | Member read, creator insert ALLOW; non-member read DENIED (0 rows), forged creator DENIED (`42501`) |
| **5. Membership & Bootstrap** | 5 | 5 / 5 PASS | Creator bootstrap ALLOW; arbitrary self-join DENIED (`42501`); owner add ALLOW; role escalation DENIED (`42501`); pref update ALLOW |
| **6. Messages RLS** | 5 | 5 / 5 PASS | Member read, own insert ALLOW; non-member read DENIED (0 rows), sender impersonation DENIED (`42501`), sender mutation DENIED (`42501`) |
| **7. Reactions/Attachments/Notifs** | 5 | 5 / 5 PASS | Member reaction ALLOW; delete other's reaction DENIED (0 rows); non-member attachment DENIED (0 rows); notification isolation ALLOW/DENY |

---

## 6. Grants & Data API Security

- **`anon` role**: 0 rows returned across all 7 tables (all policies explicitly require `TO authenticated`).
- **`authenticated` role**: Granted standard CRUD privileges gated 100% by RLS policies.
- **`service_role`**: Bypasses RLS. Server-side only (0 references in client bundles).
