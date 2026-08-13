# Authentication Architecture & Session Integration Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Stack**: Supabase Auth + Next.js App Router (`@supabase/ssr`)  
**Implementation Stage**: TASK 12 Complete  
**Git Branch**: `agent/task-12-authentication`

---

## 1. Overview & Architecture

Authentication in Nguyen's Real-time Chat App is built around Supabase Authentication and `@supabase/ssr` session management. Client-side state is managed by a dedicated `AuthProvider` (`src/context/auth-context.tsx`), while server-side route protection and cookie synchronization are handled via Next.js App Router Middleware (`src/middleware.ts`).

```
+-------------------------------------------------------------------+
|                           Browser Client                          |
|                                                                   |
|   +-------------------+    (reads session)   +----------------+   |
|   | /auth/login       | -------------------> |  AuthContext   |   |
|   | /auth/signup      |                      |  (AuthProvider)|   |
|   +-------------------+                      +-------+--------+   |
|                                                      |            |
+------------------------------------------------------|------------+
                                                       | (HTTP / SSR Cookie)
                                                       v
+-------------------------------------------------------------------+
|                        Next.js Middleware                         |
|   src/middleware.ts (@supabase/ssr createServerClient)            |
|   - Synchronizes auth cookies                                     |
|   - Redirects unauthenticated requests from / to /auth/login       |
|   - Redirects authenticated requests from /auth/* to /            |
+-------------------------------------------------------------------+
                                                       |
                                                       v
+-------------------------------------------------------------------+
|                           Supabase Auth                           |
|   - auth.users table (encrypted credentials)                      |
|   - RLS-gated public.profiles row bootstrap                       |
+-------------------------------------------------------------------+
```

---

## 2. Authentication Context (`AuthProvider`)

Located at `src/context/auth-context.tsx`.

- **State Exposed**:
  - `user`: Supabase `User | null`
  - `session`: Supabase `Session | null`
  - `profile`: `UserProfile | null` (mapped 1:1 from `public.profiles`)
  - `isLoading`: boolean
  - `isInitialized`: boolean
  - `error`: string | null
- **Methods**:
  - `signInWithPassword({ email, password })`: Authenticates credentials against Supabase Auth.
  - `signUpWithPassword({ displayName, username, email, password, confirmPassword })`: Registers user and bootstraps profile.
  - `signOut()`: Invalidates session cookies and resets React state.
  - `refreshProfile()`: Re-fetches the latest profile data from `public.profiles`.

---

## 3. Profile Bootstrap Strategy

When a user registers through `/auth/signup`:

1. Username uniqueness is checked against `public.profiles`.
2. `supabase.auth.signUp()` registers the user in Supabase `auth.users` schema.
3. Upon receiving the generated `user.id`, a matching record is inserted into `public.profiles`:
   - `id` = `auth.users.id`
   - `display_name` = User provided display name
   - `username` = Lowercase sanitized username
   - `presence_status` = `'online'`
4. Profile ownership is strictly enforced by PostgreSQL RLS (`auth.uid() = id`).
5. Passwords remain exclusively inside `auth.users` and are **NEVER** stored in `profiles`, `localStorage`, or exposed in React state.

---

## 4. Route Protection Middleware

Located at `src/middleware.ts`.

Using `@supabase/ssr` `createServerClient`:
- **Protected Routes**: `/` (Chat Application), `/settings`
  - Unauthenticated access → Redirected to `/auth/login`
- **Public/Auth Routes**: `/auth/login`, `/auth/signup`
  - Authenticated access → Redirected to `/`

---

## 5. Security & Credentials Boundaries

- **`SUPABASE_SERVICE_ROLE_KEY`**: Server-only key used for administrative CLI/migrations. **NEVER** imported or referenced in client-side bundles.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public publishable key safe for browser consumption. Data access is 100% protected by RLS.
- **Password Security**: Passwords are processed directly by Supabase Auth and never persisted in local storage or raw database fields.

---

## 6. Testing & Regression Matrix

- **Unit Tests**: `tests/unit/lib/auth.test.ts` (Form validation, username rules, error mappings)
- **E2E Tests**: `tests/e2e/auth.spec.ts` (Sign In / Sign Up render, validation rules, password toggle, page navigation)
- **Database RLS Security Suite**: `npx supabase test db` (**37 / 37 pgTAP subtests passed**)
