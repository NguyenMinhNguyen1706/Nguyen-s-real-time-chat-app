# Backend Integration Plan

**Project**: Nguyen's Real-time Chat App  
**Target Backend Engine**: Supabase (PostgreSQL + Auth + Realtime WebSockets + Storage)  
**Frontend Release State**: FROZEN (`agent/task-10-frontend-release-candidate`)  
**Backend Foundation State**: ESTABLISHED (`agent/task-11-backend-foundation`)

---

## 1. Domain Entities & Database Schema Mapping

### A. `User` / `UserProfile`

- **Frontend Model**: [`UserProfile`](file:///d:/Nguyen-s-real-time-chat-app/src/types/settings.ts), [`UserSummary`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.profiles` (linked 1:1 to `auth.users.id`)
- **Columns**: `id (uuid, PK)`, `display_name (text)`, `username (text, unique)`, `avatar_path (text)`, `bio (text)`, `presence_status (enum)`, `custom_status (text)`, `created_at (timestamptz)`, `updated_at (timestamptz)`
- **RLS Policy**: Public read for authenticated users; write restricted to `auth.uid() = id`.

### B. `Conversation`

- **Frontend Model**: [`ConversationPreview`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.conversations`
- **Columns**: `id (uuid, PK)`, `type (enum: direct | group)`, `title (text, nullable)`, `created_by (uuid, FK)`, `created_at (timestamptz)`, `updated_at (timestamptz)`
- **RLS Policy**: Read & write restricted to members of `public.conversation_members`.

### C. `ConversationMember`

- **Frontend Model**: Participant link & flags in `ConversationPreview`
- **Database Table**: `public.conversation_members`
- **Columns**: `id (uuid, PK)`, `conversation_id (uuid, FK)`, `user_id (uuid, FK)`, `role (enum: owner | admin | member)`, `is_favorite (boolean)`, `is_pinned (boolean)`, `is_muted (boolean)`, `is_archived (boolean)`, `last_read_at (timestamptz)`, `joined_at (timestamptz)`
- **Constraint**: `UNIQUE(conversation_id, user_id)`

### D. `Message`

- **Frontend Model**: [`Message`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.messages`
- **Columns**: `id (uuid, PK)`, `conversation_id (uuid, FK)`, `sender_id (uuid, FK)`, `content (text)`, `reply_to_message_id (uuid, FK, nullable)`, `status (enum: sent | delivered | read)`, `is_edited (boolean)`, `edited_at (timestamptz)`, `deleted_at (timestamptz)`, `created_at (timestamptz)`
- **RLS Policy**: Read restricted to conversation members; write restricted to `auth.uid() = sender_id`.

### E. `MessageReaction`

- **Frontend Model**: [`MessageReaction`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.message_reactions`
- **Columns**: `id (uuid, PK)`, `message_id (uuid, FK)`, `user_id (uuid, FK)`, `emoji (text)`, `created_at (timestamptz)`
- **Constraint**: `UNIQUE(message_id, user_id, emoji)`

### F. `MessageAttachment`

- **Frontend Model**: [`AttachmentPreview`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.message_attachments` + Supabase Storage bucket `chat-attachments`
- **Columns**: `id (uuid, PK)`, `message_id (uuid, FK)`, `storage_path (text)`, `file_name (text)`, `mime_type (text)`, `file_size (bigint)`

---

## 2. Supabase Client Architecture & Repository Swap Strategy

### Client Architecture

- Browser Client: [`src/lib/supabase/client.ts`](file:///d:/Nguyen-s-real-time-chat-app/src/lib/supabase/client.ts) (`createBrowserClient` via `@supabase/ssr`)
- Server Client: [`src/lib/supabase/server.ts`](file:///d:/Nguyen-s-real-time-chat-app/src/lib/supabase/server.ts) (`createServerClient` via `@supabase/ssr`)

### Repository Swap Strategy

The frontend application depends exclusively on TypeScript repository interfaces:

- [`IConversationRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/conversation-repository.ts)
- [`IMessageRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/message-repository.ts)

Currently, `ChatContext` injects `MockConversationRepository` and `MockMessageRepository`.

When full repository integration occurs in upcoming tasks:

1. We will implement `SupabaseConversationRepository` implementing `IConversationRepository`.
2. We will implement `SupabaseMessageRepository` implementing `IMessageRepository`.
3. In `ChatContext`, we will conditionally inject `SupabaseConversationRepository` & `SupabaseMessageRepository` when Supabase environment variables are present, with zero changes required in UI components.

---

## 3. Upcoming Backend Phases

- **TASK 12**: Authentication + Supabase Session Integration (NOT IMPLEMENTED YET)
- **TASK 13**: Database Repository Integration (NOT IMPLEMENTED YET)
- **TASK 14**: Supabase Realtime Messages & Typing Indicators (NOT IMPLEMENTED YET)
- **TASK 15**: Supabase Storage for File Attachments (NOT IMPLEMENTED YET)
