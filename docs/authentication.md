# Authentication Architecture & Session Integration Documentation

**Project**: Nguyen's Real-time Chat App  
**Target Stack**: Supabase Auth + Next.js App Router (`@supabase/ssr`)  
**Implementation Stage**: TASK 12.1 Complete  
**Git Branch**: `agent/task-12-1-auth-production-verification`

---

## 1. Overview & Architecture

Authentication in Nguyen's Real-time Chat App is built around Supabase Authentication and `@supabase/ssr` session management. Client-side state is managed by a dedicated `AuthProvider` (`src/context/auth-context.tsx`), while server-side route protection and cookie synchronization are handled via Next.js App Router Proxy Middleware (`src/proxy.ts`).

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
|                        Next.js 16 Proxy                           |
|   src/proxy.ts (@supabase/ssr createServerClient)                 |
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

Located at `src/proxy.ts`.

Using `@supabase/ssr` `createServerClient`:
- **Protected Routes**: `/` (Chat Application), `/settings`
  - Unauthenticated access → Redirected to `/auth/login`
- **Public/Auth Routes**: `/auth/login`, `/auth/signup`
  - Authenticated access → Redirected to `/`

---

## 5. Security & Key Modernization

- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**: Recommended modern Supabase frontend key. Supported alongside legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` across `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/proxy.ts`.
- **`SUPABASE_SERVICE_ROLE_KEY`**: Server-only key used for administrative CLI/migrations. **NEVER** imported or referenced in client-side bundles.
- **Password Security**: Passwords are processed directly by Supabase Auth and never persisted in local storage or raw database fields.

---

## 6. Local & Production Project Discovery

- **Local Discovery**: Local project configuration in `supabase/config.toml` is `Nguyen-s-real-time-chat-app` (ports: API `54321`, DB `54322`, Studio `54323`).
- **Auth Defaults**: `enable_confirmations = false` (Local dev), `minimum_password_length = 6`, `site_url = "http://127.0.0.1:3000"`.
- **Production Status**: Production Auth hosted on Vercel requires setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel Environment Variables.

---

## 7. Testing & Regression Matrix

- **ESLint**: PASS (0 errors, 0 warnings)
- **TypeScript**: PASS (0 errors via `tsc --noEmit`)
- **Unit Tests**: PASS (68 / 68 Vitest unit tests in `tests/unit/lib/auth.test.ts`)
- **E2E Tests**: PASS (42 / 42 Playwright tests in `tests/e2e/auth.spec.ts`)
- **Next.js Production Build**: PASS (static routes `/`, `/auth/login`, `/auth/signup` compiled with `ƒ Proxy`)
- **Database RLS Security Suite**: 37 / 37 pgTAP assertions verified in TASK 11.3
