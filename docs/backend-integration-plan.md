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

## 3. TASK 11.1 Security Corrections

The following issues were identified and fixed during TASK 11.1 RLS hardening:

1. **CRITICAL — `conversation_members` INSERT policy was effectively `TO authenticated`**: The `OR auth.uid() IS NOT NULL` clause allowed any authenticated user to insert any user into any conversation. Fixed to require `auth.uid() = user_id` (bootstrap) OR existing `owner/admin` role.
2. **CRITICAL — `conversation_members` SELECT policy had infinite recursion**: Self-referential subquery on same RLS-protected table. Fixed with two non-recursive policies: direct ownership check + `IN` subquery pattern.
3. **HIGH — `messages` UPDATE policy missing `WITH CHECK`**: Allowed `sender_id` mutation (impersonation) and `conversation_id` migration. Fixed with `WITH CHECK (auth.uid() = sender_id AND EXISTS member check)`.
4. **HIGH — Seed data in migration**: Profiles FK → `auth.users.id` but seed didn't create `auth.users` rows. Moved seed to `supabase/seed.sql` with proper `auth.users` + `auth.identities` bootstrap.
5. **MEDIUM — Missing `conversation_members` DELETE policy**: Added policy allowing self-removal or owner/admin removal.
6. **MEDIUM — Missing `conversations` UPDATE `WITH CHECK`**: Added bidirectional authorization check.
7. **LOW — Missing `updated_at` auto-trigger**: Added `handle_updated_at()` trigger function for `profiles`, `conversations`, `messages`.

---

## 4. Data Flow Architecture

### Current (Frontend Mock)

```
UI Components
    ↓
ChatContext (React Context)
    ↓
IConversationRepository / IMessageRepository (Interface)
    ↓
MockConversationRepository / MockMessageRepository (In-memory)
```

### Future (Supabase Backend)

```
UI Components
    ↓
ChatContext / Application Services
    ↓
IConversationRepository / IMessageRepository (Interface)
    ↓
SupabaseConversationRepository / SupabaseMessageRepository
    ↓
Supabase Client (@supabase/ssr)
    ↓
PostgreSQL (RLS-protected) + Supabase Realtime + Supabase Storage
```

---

## 5. Upcoming Backend Phases

- **TASK 12**: Authentication + Supabase Session Integration (NOT IMPLEMENTED YET)
- **TASK 13**: Database Repository Integration (NOT IMPLEMENTED YET)
- **TASK 14**: Supabase Realtime Messages & Typing Indicators (NOT IMPLEMENTED YET)
- **TASK 15**: Supabase Storage for File Attachments (NOT IMPLEMENTED YET)
