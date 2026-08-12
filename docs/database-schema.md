# Supabase Database Schema & Architecture Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Engine**: PostgreSQL (Supabase)  
**Migration Version**: `00001` through `00004`  
**RLS Hardened**: TASK 11.1

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

| Column            | Type        | Constraints                                                         | Notes                        |
| ----------------- | ----------- | ------------------------------------------------------------------- | ---------------------------- |
| `id`              | UUID        | PK, FK → `auth.users.id` ON DELETE CASCADE                          |                              |
| `display_name`    | TEXT        | NOT NULL                                                            |                              |
| `username`        | TEXT        | NOT NULL, UNIQUE                                                    |                              |
| `avatar_path`     | TEXT        | Nullable                                                            | Storage path or external URL |
| `bio`             | TEXT        | Nullable                                                            |                              |
| `presence_status` | VARCHAR(20) | NOT NULL, DEFAULT `'online'`, CHECK `(online\|offline\|away\|busy)` |                              |
| `custom_status`   | VARCHAR(50) | Nullable                                                            |                              |
| `created_at`      | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                                           |                              |
| `updated_at`      | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger                             |                              |

**Privacy Decision**: All profile columns are considered public to authenticated users. The `profiles` table does NOT contain email or credentials — those live exclusively in `auth.users` (not exposed via Supabase Data API). This supports user discovery and chat header rendering.

### `public.conversations`

| Column       | Type        | Constraints                                           | Notes                 |
| ------------ | ----------- | ----------------------------------------------------- | --------------------- |
| `id`         | UUID        | PK, DEFAULT `gen_random_uuid()`                       |                       |
| `type`       | VARCHAR(20) | NOT NULL, DEFAULT `'direct'`, CHECK `(direct\|group)` |                       |
| `title`      | TEXT        | Nullable                                              | NULL for direct chats |
| `created_by` | UUID        | FK → `profiles.id` ON DELETE SET NULL                 |                       |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                             |                       |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger               |                       |

### `public.conversation_members`

| Column            | Type        | Constraints                                                  | Notes                |
| ----------------- | ----------- | ------------------------------------------------------------ | -------------------- |
| `id`              | UUID        | PK, DEFAULT `gen_random_uuid()`                              |                      |
| `conversation_id` | UUID        | NOT NULL, FK → `conversations.id` ON DELETE CASCADE          |                      |
| `user_id`         | UUID        | NOT NULL, FK → `profiles.id` ON DELETE CASCADE               |                      |
| `role`            | VARCHAR(20) | NOT NULL, DEFAULT `'member'`, CHECK `(owner\|admin\|member)` |                      |
| `is_favorite`     | BOOLEAN     | NOT NULL, DEFAULT `false`                                    |                      |
| `is_pinned`       | BOOLEAN     | NOT NULL, DEFAULT `false`                                    |                      |
| `is_muted`        | BOOLEAN     | NOT NULL, DEFAULT `false`                                    |                      |
| `is_archived`     | BOOLEAN     | NOT NULL, DEFAULT `false`                                    |                      |
| `last_read_at`    | TIMESTAMPTZ | Nullable                                                     | Read position cursor |
| `joined_at`       | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                                    |                      |

**Constraint**: `UNIQUE(conversation_id, user_id)` — prevents duplicate membership.

### `public.messages`

| Column                | Type        | Constraints                                         | Notes                  |
| --------------------- | ----------- | --------------------------------------------------- | ---------------------- |
| `id`                  | UUID        | PK, DEFAULT `gen_random_uuid()`                     |                        |
| `conversation_id`     | UUID        | NOT NULL, FK → `conversations.id` ON DELETE CASCADE |                        |
| `sender_id`           | UUID        | NOT NULL, FK → `profiles.id` ON DELETE CASCADE      |                        |
| `content`             | TEXT        | NOT NULL                                            | Plain text only        |
| `reply_to_message_id` | UUID        | FK → `messages.id` ON DELETE SET NULL               |                        |
| `status`              | VARCHAR(20) | NOT NULL, DEFAULT `'sent'`                          | See Status Model below |
| `is_edited`           | BOOLEAN     | NOT NULL, DEFAULT `false`                           |                        |
| `edited_at`           | TIMESTAMPTZ | Nullable                                            |                        |
| `deleted_at`          | TIMESTAMPTZ | Nullable                                            | Soft deletion          |
| `created_at`          | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                           |                        |
| `updated_at`          | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger             |                        |

**Soft Deletion Model**: When a message is soft-deleted, `deleted_at` is set to a timestamp. The message row remains so that `reply_to_message_id` references remain structurally valid. The frontend renders deleted messages as "This message was deleted" placeholders. Hard deletion is available via `DELETE` (sender only) but breaks reply references (SET NULL).

**Message Status Model Decision**: The `status` column persists `sent` as the default database state. Transient states (`pending`, `delivered`) are client-side transport concerns. Read state is derived from `conversation_members.last_read_at` compared to `messages.created_at`. This avoids per-message per-user read tracking overhead.

### `public.message_reactions`

| Column       | Type        | Constraints                                    | Notes |
| ------------ | ----------- | ---------------------------------------------- | ----- |
| `id`         | UUID        | PK, DEFAULT `gen_random_uuid()`                |       |
| `message_id` | UUID        | NOT NULL, FK → `messages.id` ON DELETE CASCADE |       |
| `user_id`    | UUID        | NOT NULL, FK → `profiles.id` ON DELETE CASCADE |       |
| `emoji`      | VARCHAR(32) | NOT NULL                                       |       |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                      |       |

**Constraint**: `UNIQUE(message_id, user_id, emoji)` — one reaction per user per emoji per message.

### `public.message_attachments`

| Column         | Type         | Constraints                                    | Notes                 |
| -------------- | ------------ | ---------------------------------------------- | --------------------- |
| `id`           | UUID         | PK, DEFAULT `gen_random_uuid()`                |                       |
| `message_id`   | UUID         | NOT NULL, FK → `messages.id` ON DELETE CASCADE |                       |
| `storage_path` | TEXT         | NOT NULL                                       | Supabase Storage path |
| `file_name`    | TEXT         | NOT NULL                                       |                       |
| `mime_type`    | VARCHAR(100) | NOT NULL                                       |                       |
| `file_size`    | BIGINT       | NOT NULL, CHECK `(file_size >= 0)`             |                       |
| `created_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT `now()`                      |                       |

### `public.notifications`

| Column            | Type        | Constraints                                    | Notes |
| ----------------- | ----------- | ---------------------------------------------- | ----- |
| `id`              | UUID        | PK, DEFAULT `gen_random_uuid()`                |       |
| `user_id`         | UUID        | NOT NULL, FK → `profiles.id` ON DELETE CASCADE |       |
| `type`            | VARCHAR(50) | NOT NULL                                       |       |
| `conversation_id` | UUID        | FK → `conversations.id` ON DELETE CASCADE      |       |
| `message_id`      | UUID        | FK → `messages.id` ON DELETE CASCADE           |       |
| `read_at`         | TIMESTAMPTZ | Nullable                                       |       |
| `created_at`      | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                      |       |

---

## 3. Performance Indexes

| Index Name                            | Table                  | Columns                              | Access Pattern                          |
| ------------------------------------- | ---------------------- | ------------------------------------ | --------------------------------------- |
| `idx_messages_conversation_created`   | `messages`             | `(conversation_id, created_at DESC)` | Message timeline rendering              |
| `idx_conversation_members_user_convo` | `conversation_members` | `(user_id, conversation_id)`         | User's conversation list + RLS policies |
| `idx_conversation_members_convo_user` | `conversation_members` | `(conversation_id, user_id)`         | Conversation participant lookups        |
| `idx_message_reactions_message`       | `message_reactions`    | `(message_id)`                       | Reaction pill aggregation               |
| `idx_notifications_user_created`      | `notifications`        | `(user_id, created_at DESC)`         | Notification feed                       |
| `idx_profiles_username`               | `profiles`             | `(username)`                         | Username search/lookup                  |

**RLS Policy Performance**: The `idx_conversation_members_user_convo` and `idx_conversation_members_convo_user` indexes directly support the RLS membership subqueries used across `conversations`, `messages`, `message_reactions`, and `message_attachments` policies.

---

## 4. Row Level Security (RLS) Policy Model

All 7 tables have `ENABLE ROW LEVEL SECURITY`. Policies verify `auth.uid()` against ownership and membership relationships.

### 4.1 Profiles

| Operation | Policy            | Rule                                                   |
| --------- | ----------------- | ------------------------------------------------------ |
| SELECT    | All authenticated | `USING (true)` — public profile fields                 |
| INSERT    | Own profile only  | `WITH CHECK (auth.uid() = id)`                         |
| UPDATE    | Own profile only  | `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)` |

### 4.2 Conversations

| Operation | Policy       | Rule                                       |
| --------- | ------------ | ------------------------------------------ |
| SELECT    | Members only | `USING (EXISTS member check)`              |
| INSERT    | Creator only | `WITH CHECK (auth.uid() = created_by)`     |
| UPDATE    | Members only | `USING + WITH CHECK (EXISTS member check)` |

### 4.3 Conversation Members

| Operation        | Policy              | Rule                                                                 |
| ---------------- | ------------------- | -------------------------------------------------------------------- |
| SELECT (own)     | Direct ownership    | `USING (auth.uid() = user_id)`                                       |
| SELECT (fellows) | Shared membership   | `USING (conversation_id IN (SELECT ... WHERE user_id = auth.uid()))` |
| INSERT           | Bootstrap or admin  | `WITH CHECK (auth.uid() = user_id OR EXISTS owner/admin check)`      |
| UPDATE           | Own membership only | `USING + WITH CHECK (auth.uid() = user_id)`                          |
| DELETE           | Self or admin       | `USING (auth.uid() = user_id OR EXISTS owner/admin check)`           |

**Bootstrap Pattern**: When creating a new conversation, the creator inserts the first `conversation_members` row with `user_id = auth.uid()` and `role = 'owner'`. After bootstrap, only owners/admins can add additional members.

### 4.4 Messages

| Operation | Policy               | Rule                                                                                         |
| --------- | -------------------- | -------------------------------------------------------------------------------------------- |
| SELECT    | Conversation members | `USING (EXISTS member check)`                                                                |
| INSERT    | Sender + member      | `WITH CHECK (auth.uid() = sender_id AND EXISTS member check)`                                |
| UPDATE    | Sender + member      | `USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id AND EXISTS member check)` |
| DELETE    | Sender only          | `USING (auth.uid() = sender_id)`                                                             |

**Hardened UPDATE**: The `WITH CHECK` clause on UPDATE enforces that `sender_id` cannot be changed (prevents impersonation) AND that `conversation_id` cannot be moved to a conversation the user doesn't belong to.

### 4.5 Message Reactions

| Operation | Policy                    | Rule                                           |
| --------- | ------------------------- | ---------------------------------------------- |
| SELECT    | Conversation members      | Via `messages` JOIN `conversation_members`     |
| INSERT    | Own + conversation member | `auth.uid() = user_id AND EXISTS member check` |
| DELETE    | Own only                  | `USING (auth.uid() = user_id)`                 |

### 4.6 Message Attachments

| Operation | Policy               | Rule                                       |
| --------- | -------------------- | ------------------------------------------ |
| SELECT    | Conversation members | Via `messages` JOIN `conversation_members` |
| INSERT    | Conversation members | Via `messages` JOIN `conversation_members` |

### 4.7 Notifications

| Operation | Policy   | Rule                                        |
| --------- | -------- | ------------------------------------------- |
| SELECT    | Own only | `USING (auth.uid() = user_id)`              |
| UPDATE    | Own only | `USING + WITH CHECK (auth.uid() = user_id)` |

---

## 5. RLS Security Test Matrix

| #   | Table         | Test                      | Actor             | Expected | Attack Vector            |
| --- | ------------- | ------------------------- | ----------------- | -------- | ------------------------ |
| P1  | profiles      | SELECT own                | User A            | ALLOW    | —                        |
| P2  | profiles      | SELECT other              | User A→B          | ALLOW    | Public profile           |
| P3  | profiles      | UPDATE own                | User A            | ALLOW    | —                        |
| P4  | profiles      | UPDATE other              | User A→B          | DENY     | Cross-user mutation      |
| CV1 | conversations | SELECT (member)           | User A            | ALLOW    | —                        |
| CV2 | conversations | SELECT (not member)       | User C            | DENY     | Unauthorized access      |
| CV3 | conversations | SELECT (not member)       | User A→Conv4      | DENY     | Cross-conversation       |
| CM1 | members       | INSERT self (bootstrap)   | User A            | ALLOW    | —                        |
| CM2 | members       | INSERT other (as owner)   | User A (owner)    | ALLOW    | —                        |
| CM3 | members       | INSERT self into existing | User C            | ALLOW    | Bootstrap                |
| CM4 | members       | INSERT other (not admin)  | User C→Conv4      | DENY     | Privilege escalation     |
| CM5 | members       | UPDATE own prefs          | User A            | ALLOW    | —                        |
| CM6 | members       | UPDATE other prefs        | User A→B          | DENY     | Cross-user               |
| M1  | messages      | SELECT (member)           | User A            | ALLOW    | —                        |
| M2  | messages      | SELECT (not member)       | User C            | DENY     | Unauthorized read        |
| M3  | messages      | INSERT as self            | User A            | ALLOW    | —                        |
| M4  | messages      | INSERT as other           | User A→B sender   | DENY     | Impersonation            |
| M5  | messages      | UPDATE own content        | User A            | ALLOW    | —                        |
| M6  | messages      | UPDATE other's msg        | User B→A msg      | DENY     | Cross-user edit          |
| M7  | messages      | UPDATE sender_id          | User A            | DENY     | Impersonation via UPDATE |
| M8  | messages      | UPDATE conversation_id    | User A            | DENY     | Message migration attack |
| M9  | messages      | DELETE own                | User A            | ALLOW    | —                        |
| M10 | messages      | DELETE other's            | User B→A msg      | DENY     | Cross-user deletion      |
| R1  | reactions     | INSERT own                | User A            | ALLOW    | —                        |
| R2  | reactions     | DELETE own                | User A            | ALLOW    | —                        |
| R3  | reactions     | DELETE other's            | User A→B reaction | DENY     | Cross-user               |
| A1  | attachments   | SELECT (member)           | User A            | ALLOW    | —                        |
| A2  | attachments   | SELECT (not member)       | User C            | DENY     | Unauthorized             |
| N1  | notifications | SELECT own                | User A            | ALLOW    | —                        |
| N2  | notifications | SELECT other's            | User B→A          | DENY     | Cross-user               |
| N3  | notifications | UPDATE own read_at        | User A            | ALLOW    | —                        |

---

## 6. Grants & Data API Security

Supabase automatically grants `SELECT`, `INSERT`, `UPDATE`, `DELETE` privileges to `anon` and `authenticated` roles on `public` schema tables via the Data API (PostgREST). RLS is the authorization layer that restricts actual row access.

- **`anon` role**: Can access public tables but all RLS policies require `TO authenticated`, so anonymous access returns 0 rows on all 7 tables.
- **`authenticated` role**: All policies scoped to `auth.uid()` identity verification.
- **`service_role`**: Bypasses RLS. Used only server-side for admin operations. Never exposed to browser.

---

## 7. Seed Strategy

Seed data lives in [`supabase/seed.sql`](file:///d:/Nguyen-s-real-time-chat-app/supabase/seed.sql) (NOT in migrations).

- Creates 5 test users in `auth.users` + `auth.identities` for local Supabase login
- Creates corresponding `profiles` rows
- Creates 4 conversations (2 direct, 2 group)
- Creates 10 membership rows with varied roles
- Creates 5 messages including a reply
- Creates 4 reactions
- Creates 1 attachment metadata row
- Uses deterministic UUIDs for reproducible testing

Run: `supabase db seed` or `psql $SUPABASE_DB_URL -f supabase/seed.sql`

---

## 8. Search Preparation (NOT IMPLEMENTED YET)

Future PostgreSQL full-text search options:

1. `pg_trgm` extension with GIN index on `messages.content` for `LIKE`/`ILIKE` queries
2. `tsvector` column on `messages` with GIN index for full-text search
3. Supabase `.textSearch()` client method

Current search operates entirely on frontend mock data.
