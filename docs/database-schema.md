# Supabase Database Schema & Architecture Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Engine**: PostgreSQL (Supabase)  
**Migration Version**: `00001` through `00004`

---

## 1. Overview & ER Architecture

The database architecture is designed to support high-performance real-time messaging, role-based conversation management, reactions, attachments, and user profiles with Row Level Security (RLS) enabled on 100% of tables.

```
                      +-------------------+
                      |    auth.users     |
                      +---------+---------+
                                |
                                v (1:1)
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
+-----+------------+-----+  (parent conversation validation)
      |            |
      v (1:N)      v (1:N)
+-----+----+  +----+-------------+
|reactions |  |  attachments     |
+----------+  +------------------+
```

---

## 2. Table Specifications

### `public.profiles`

Stores extended user profile information linked 1:1 with `auth.users.id`.

- `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE)
- `display_name` (TEXT, NOT NULL)
- `username` (TEXT, NOT NULL, UNIQUE)
- `avatar_path` (TEXT, Nullable)
- `bio` (TEXT, Nullable)
- `presence_status` (VARCHAR(20), NOT NULL, DEFAULT `'online'`, CHECK in `online`, `offline`, `away`, `busy`)
- `custom_status` (VARCHAR(50), Nullable)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### `public.conversations`

Stores direct and group chat metadata.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `type` (VARCHAR(20), NOT NULL, DEFAULT `'direct'`, CHECK in `direct`, `group`)
- `title` (TEXT, Nullable for direct chats)
- `created_by` (UUID, FK -> `public.profiles.id` ON DELETE SET NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### `public.conversation_members`

Junction table managing conversation participants and local user preferences.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `conversation_id` (UUID, NOT NULL, FK -> `public.conversations.id` ON DELETE CASCADE)
- `user_id` (UUID, NOT NULL, FK -> `public.profiles.id` ON DELETE CASCADE)
- `role` (VARCHAR(20), NOT NULL, DEFAULT `'member'`, CHECK in `owner`, `admin`, `member`)
- `is_favorite` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `is_pinned` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `is_muted` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `is_archived` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `last_read_at` (TIMESTAMPTZ, Nullable)
- `joined_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraint**: `UNIQUE(conversation_id, user_id)`

### `public.messages`

Stores message timeline content and metadata.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `conversation_id` (UUID, NOT NULL, FK -> `public.conversations.id` ON DELETE CASCADE)
- `sender_id` (UUID, NOT NULL, FK -> `public.profiles.id` ON DELETE CASCADE)
- `content` (TEXT, NOT NULL)
- `reply_to_message_id` (UUID, FK -> `public.messages.id` ON DELETE SET NULL)
- `status` (VARCHAR(20), NOT NULL, DEFAULT `'sent'`)
- `is_edited` (BOOLEAN, NOT NULL, DEFAULT `false`)
- `edited_at` (TIMESTAMPTZ, Nullable)
- `deleted_at` (TIMESTAMPTZ, Nullable for soft deletion)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### `public.message_reactions`

Stores emoji reactions added by users to specific messages.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `message_id` (UUID, NOT NULL, FK -> `public.messages.id` ON DELETE CASCADE)
- `user_id` (UUID, NOT NULL, FK -> `public.profiles.id` ON DELETE CASCADE)
- `emoji` (VARCHAR(32), NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)
- **Constraint**: `UNIQUE(message_id, user_id, emoji)`

### `public.message_attachments`

Stores file attachment metadata linked to messages.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `message_id` (UUID, NOT NULL, FK -> `public.messages.id` ON DELETE CASCADE)
- `storage_path` (TEXT, NOT NULL)
- `file_name` (TEXT, NOT NULL)
- `mime_type` (VARCHAR(100), NOT NULL)
- `file_size` (BIGINT, NOT NULL, CHECK `file_size >= 0`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

### `public.notifications`

Stores user notification events.

- `id` (UUID, PK, DEFAULT `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, FK -> `public.profiles.id` ON DELETE CASCADE)
- `type` (VARCHAR(50), NOT NULL)
- `conversation_id` (UUID, FK -> `public.conversations.id` ON DELETE CASCADE)
- `message_id` (UUID, FK -> `public.messages.id` ON DELETE CASCADE)
- `read_at` (TIMESTAMPTZ, Nullable)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `now()`)

---

## 3. Performance Indexes

1. `idx_messages_conversation_created` on `public.messages(conversation_id, created_at DESC)`  
   _Optimizes timeline rendering by loading recent conversation messages in reverse chronological order._
2. `idx_conversation_members_user_convo` on `public.conversation_members(user_id, conversation_id)`  
   _Optimizes fetching all active conversations for a user._
3. `idx_conversation_members_convo_user` on `public.conversation_members(conversation_id, user_id)`  
   _Optimizes fetching all participant profiles for a target conversation._
4. `idx_message_reactions_message` on `public.message_reactions(message_id)`  
   _Optimizes reaction pill aggregation for messages._
5. `idx_notifications_user_created` on `public.notifications(user_id, created_at DESC)`  
   _Optimizes fetching unread notification feeds._
6. `idx_profiles_username` on `public.profiles(username)`  
   _Optimizes username lookup during contact search._

---

## 4. Row Level Security (RLS) Policy Summary

All 7 tables have Row Level Security explicitly enabled (`ENABLE ROW LEVEL SECURITY`). Access rules verify authentic `auth.uid()` identity against conversation membership (`conversation_members`) so users can never read, modify, or delete messages in chats they do not belong to.
