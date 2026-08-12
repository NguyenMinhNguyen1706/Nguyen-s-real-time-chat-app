# Backend Integration Plan

**Project**: Nguyen's Real-time Chat App  
**Target Backend Engine**: Supabase (PostgreSQL + Auth + Realtime WebSockets + Storage)  
**Frontend Release State**: FROZEN (`agent/task-10-frontend-release-candidate`)

---

## 1. Domain Entities & Database Schema Mapping

### A. `User` / `UserProfile`

- **Frontend Model**: [`UserProfile`](file:///d:/Nguyen-s-real-time-chat-app/src/types/settings.ts), [`UserSummary`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.profiles` (linked to `auth.users.id`)
- **Columns**: `id (uuid, PK)`, `name (text)`, `username (text, unique)`, `avatar_url (text)`, `bio (text)`, `status_message (text)`, `presence_status (enum)`, `created_at (timestamptz)`
- **Repository Interface**: `IUserRepository`

### B. `Conversation`

- **Frontend Model**: [`ConversationPreview`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.conversations`
- **Columns**: `id (uuid, PK)`, `type (enum: direct | group)`, `title (text, nullable)`, `avatar_url (text, nullable)`, `created_at (timestamptz)`, `updated_at (timestamptz)`
- **Repository Interface**: [`IConversationRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/conversation-repository.ts)

### C. `ConversationMember`

- **Frontend Model**: Participant link in `ConversationPreview`
- **Database Table**: `public.conversation_members`
- **Columns**: `id (uuid, PK)`, `conversation_id (uuid, FK)`, `user_id (uuid, FK)`, `role (enum: owner | admin | member)`, `is_favorite (boolean)`, `is_pinned (boolean)`, `is_muted (boolean)`, `is_archived (boolean)`, `last_read_at (timestamptz)`

### D. `Message`

- **Frontend Model**: [`Message`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.messages`
- **Columns**: `id (uuid, PK)`, `conversation_id (uuid, FK)`, `sender_id (uuid, FK)`, `content (text)`, `status (enum: sent | delivered | read)`, `is_edited (boolean)`, `reply_to_message_id (uuid, FK, nullable)`, `created_at (timestamptz)`, `updated_at (timestamptz)`
- **Repository Interface**: [`IMessageRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/message-repository.ts)

### E. `MessageReaction`

- **Frontend Model**: [`MessageReaction`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.message_reactions`
- **Columns**: `id (uuid, PK)`, `message_id (uuid, FK)`, `user_id (uuid, FK)`, `emoji (text)`, `created_at (timestamptz)`

### F. `MessageAttachment`

- **Frontend Model**: [`AttachmentPreview`](file:///d:/Nguyen-s-real-time-chat-app/src/types/chat.ts)
- **Database Table**: `public.attachments` + Supabase Storage bucket `chat-attachments`
- **Columns**: `id (uuid, PK)`, `message_id (uuid, FK)`, `name (text)`, `size (bigint)`, `mime_type (text)`, `url (text)`

---

## 2. Repository Pattern Boundary & Swap Strategy

The frontend application depends exclusively on TypeScript repository interfaces:

- [`IConversationRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/conversation-repository.ts)
- [`IMessageRepository`](file:///d:/Nguyen-s-real-time-chat-app/src/repositories/message-repository.ts)

Currently, `ChatContext` injects `MockConversationRepository` and `MockMessageRepository`.

When backend integration begins in TASK 11:

1. We will implement `SupabaseConversationRepository` implementing `IConversationRepository`.
2. We will implement `SupabaseMessageRepository` implementing `IMessageRepository`.
3. In `ChatContext`, we will inject `SupabaseConversationRepository` & `SupabaseMessageRepository` when Supabase environment variables are present, with zero changes required in UI components.

---

## 3. Realtime WebSockets & Presence Strategy

- **Realtime Messages**: Supabase Realtime Postgres Changes subscription listening on `public.messages` INSERT / UPDATE / DELETE events.
- **Typing Indicator**: Supabase Realtime Broadcast channel (`conversation:{id}`).
- **Presence Status**: Supabase Realtime Presence channel (`online-users`).
