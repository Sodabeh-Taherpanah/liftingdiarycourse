# Auth Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com) for all authentication.** Do not implement any custom auth, session management, or JWT handling. Clerk owns the full auth lifecycle.

Install:

```bash
npm install @clerk/nextjs
```

Required environment variables (set in `.env.local`):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## ClerkProvider

`<ClerkProvider>` is already mounted in `src/app/layout.tsx` wrapping the entire app. **Do not add it anywhere else.**

---

## Proxy (Next.js 16)

**This project uses Next.js 16**, which renames `middleware.ts` → `proxy.ts` and exports `proxy` instead of `middleware`. The Clerk proxy is already configured in `src/proxy.ts`:

```ts
// src/proxy.ts  ✅ correct
import { clerkMiddleware } from '@clerk/nextjs/server'
export default clerkMiddleware()
```

- NEVER create a `middleware.ts` file — it will be ignored in Next.js 16
- NEVER use the `edge` runtime in `proxy.ts` — use `nodejs` only

---

## Reading Auth in Server Components

Use `auth()` from `@clerk/nextjs/server` inside Server Components and Server Actions. It is **async** — always `await` it.

```ts
// ✅ correct
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const { userId } = await auth()
if (!userId) redirect('/sign-in')
```

```ts
// ❌ wrong — auth() is async, synchronous access is removed in Next.js 16
const { userId } = auth()
```

- Always redirect unauthenticated users to `/sign-in` immediately after the `auth()` call
- Pass `userId` into data helper functions — never read it inside the helpers themselves (see `docs/data-fetching.md`)

---

## UI Components

Use Clerk's built-in components for auth UI. **Do not build custom sign-in/sign-up forms.**

| Component | Purpose |
|---|---|
| `<SignInButton mode="modal">` | Triggers Clerk's hosted sign-in modal |
| `<SignUpButton mode="modal">` | Triggers Clerk's hosted sign-up modal |
| `<UserButton />` | Avatar + dropdown for signed-in users |
| `<Show when="signed-in">` | Conditionally renders children for signed-in state |
| `<Show when="signed-out">` | Conditionally renders children for signed-out state |

All of the above are imported from `@clerk/nextjs`.

```tsx
// ✅ correct — from src/app/layout.tsx
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

<Show when='signed-out'>
  <SignInButton mode='modal'>...</SignInButton>
  <SignUpButton mode='modal'>...</SignUpButton>
</Show>
<Show when='signed-in'>
  <UserButton />
</Show>
```

---

## What NOT to Do

- NEVER store `userId` in URL params, request bodies, or client state and trust it as an auth source
- NEVER use `currentUser()` to get the `userId` for database queries — use `auth()` instead (it is faster and works in edge-adjacent contexts)
- NEVER write raw session or token logic
- NEVER fetch user identity from the client — always resolve it server-side via `auth()`
