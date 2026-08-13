# Supabase Database Schema & Architecture Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Engine**: PostgreSQL (Supabase)  
**Migration Version**: `00001` through `00004`  
**RLS Hardened & Finalized**: TASK 11.2

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

**Privacy Decision**: `display_name`, `username`, `avatar_path`, `bio`, `presence_status`, and `custom_status` are public profile fields accessible to authenticated users for contact discovery and chat headers. Private credentials and email addresses reside exclusively in `auth.users`, which is strictly protected by Supabase Auth and never exposed via the Data API.

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

| Column                | Type        | Constraints                                         | Notes               |
| --------------------- | ----------- | --------------------------------------------------- | ------------------- |
| `id`                  | UUID        | PK, DEFAULT `gen_random_uuid()`                     |                     |
| `conversation_id`     | UUID        | NOT NULL, FK → `conversations.id` ON DELETE CASCADE |                     |
| `sender_id`           | UUID        | NOT NULL, FK → `profiles.id` ON DELETE CASCADE      |                     |
| `content`             | TEXT        | NOT NULL                                            | Plain text only     |
| `reply_to_message_id` | UUID        | FK → `messages.id` ON DELETE SET NULL               |                     |
| `status`              | VARCHAR(20) | NOT NULL, DEFAULT `'sent'`                          | Persistent DB state |
| `is_edited`           | BOOLEAN     | NOT NULL, DEFAULT `false`                           |                     |
| `edited_at`           | TIMESTAMPTZ | Nullable                                            |                     |
| `deleted_at`          | TIMESTAMPTZ | Nullable                                            | Soft deletion       |
| `created_at`          | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`                           |                     |
| `updated_at`          | TIMESTAMPTZ | NOT NULL, DEFAULT `now()`, auto-trigger             |                     |

---

## 3. Final Bootstrap & Membership Authorization Model

In TASK 11.2, the conversation membership insertion and update rules were hardened against arbitrary self-joins and role escalation:

1. **Creator Self-Bootstrap**: When a user creates a new conversation (`conversations.created_by = auth.uid()`), they are allowed to insert their own membership row as `owner` (`user_id = auth.uid() AND role = 'owner'`).
2. **Owner/Admin Member Addition**: Owners or admins of a conversation can add other users to that conversation.
3. **Arbitrary Self-Join Prevention**: Arbitrary authenticated users CANNOT insert themselves into existing conversations created by others.
4. **Anti-Role-Escalation**: Regular members updating their membership preferences (`is_pinned`, `is_favorite`, `is_muted`, `is_archived`, `last_read_at`) are prohibited from escalating their `role` column via a strict `WITH CHECK` comparison against the existing row.

---

## 4. Row Level Security (RLS) Policy Summary

All 7 tables have `ENABLE ROW LEVEL SECURITY`.

| Table                  | SELECT               | INSERT                               | UPDATE                                               | DELETE                           |
| ---------------------- | -------------------- | ------------------------------------ | ---------------------------------------------------- | -------------------------------- |
| `profiles`             | All authenticated    | Own id                               | Own id                                               | —                                |
| `conversations`        | Members only         | Creator (`created_by = auth.uid()`)  | Members only                                         | —                                |
| `conversation_members` | Own + fellow members | Creator bootstrap OR owner/admin add | Own prefs (no role change) OR owner role manage      | Self leave OR owner/admin remove |
| `messages`             | Members only         | Sender + member                      | Sender + member (`sender_id` & `convo_id` immutable) | Sender only                      |
| `message_reactions`    | Members only         | Member + own `user_id`               | —                                                    | Own `user_id` only               |
| `message_attachments`  | Members only         | Member only                          | —                                                    | —                                |
| `notifications`        | Recipient only       | System/Server                        | Recipient only (`read_at`)                           | —                                |

---

## 5. RLS Security Test Matrix

| #   | Test Scenario                            | Actor           | Expected | RLS Policy Rule                           |
| --- | ---------------------------------------- | --------------- | -------- | ----------------------------------------- |
| P1  | SELECT own profile                       | User A          | ALLOW    | `USING (true)`                            |
| P2  | SELECT other profile                     | User A → B      | ALLOW    | Public profile fields                     |
| P3  | UPDATE own profile                       | User A          | ALLOW    | `auth.uid() = id`                         |
| P4  | UPDATE other profile                     | User A → B      | DENY     | `auth.uid() != id`                        |
| C1  | INSERT conversation (created_by = self)  | User A          | ALLOW    | `auth.uid() = created_by`                 |
| C2  | INSERT conversation (created_by = other) | User A → B      | DENY     | `auth.uid() != created_by`                |
| C3  | SELECT conversation (member)             | User A          | ALLOW    | `EXISTS conversation_members`             |
| C4  | SELECT conversation (non-member)         | User C          | DENY     | 0 rows returned                           |
| M1  | Creator self-bootstrap as owner          | User A          | ALLOW    | Creator check + `role = 'owner'`          |
| M2  | Arbitrary self-join into someone's chat  | User C → Conv 4 | DENY     | Not creator nor owner/admin               |
| M3  | Owner adds new member                    | User B → User C | ALLOW    | Owner check                               |
| M4  | Regular member role escalation           | User C → owner  | DENY     | Role immutable via `WITH CHECK`           |
| M5  | Update own preferences (pinned)          | User C          | ALLOW    | `auth.uid() = user_id AND role unchanged` |
| MS1 | Read messages in own chat                | User A          | ALLOW    | Member check                              |
| MS2 | Read messages in other's chat            | User C          | DENY     | 0 rows returned                           |
| MS3 | Send message as self                     | User A          | ALLOW    | `sender_id = auth.uid()`                  |
| MS4 | Send message as someone else             | User A → B      | DENY     | `sender_id != auth.uid()`                 |
| MS5 | Edit own message content                 | User A          | ALLOW    | `sender_id = auth.uid()`                  |
| MS6 | Mutate sender_id on edit                 | User A → B      | DENY     | `WITH CHECK sender_id`                    |
| MS7 | Mutate conversation_id on edit           | User A          | DENY     | `WITH CHECK member check`                 |
| MS8 | Delete own message                       | User A          | ALLOW    | `sender_id = auth.uid()`                  |
| MS9 | Delete someone else's message            | User B → A      | DENY     | `sender_id != auth.uid()`                 |

---

## 6. Grants & Data API Security

- **`anon` role**: 0 rows returned across all 7 tables (all policies require `TO authenticated`).
- **`authenticated` role**: Grants standard CRUD permissions gated 100% by RLS policies.
- **`service_role`**: Bypasses RLS. Server-side only (never exposed to browser bundles).

---

## 7. Executed Local Validation & Limitations

- **Docker Status**: Docker Desktop daemon was not active during TASK 11.2 execution (`failed to connect to docker API`).
- **Validation Status**: `LOCAL DATABASE VALIDATION BLOCKED` — Local Supabase stack (`npx supabase start`) could not be launched due to absent Docker container engine.
- **Static Schema Validation**: All SQL syntax, table structures, constraints, triggers, and RLS policies have been statically verified and linted.
- **Automated Test Matrix**: 31 detailed test cases prepared in [`supabase/tests/rls_security_matrix.sql`](file:///d:/Nguyen-s-real-time-chat-app/supabase/tests/rls_security_matrix.sql) ready to execute against a live PostgreSQL instance upon authentication integration in TASK 12.
