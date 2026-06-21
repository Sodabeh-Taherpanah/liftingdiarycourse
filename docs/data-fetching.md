# Data Fetching Standards

## Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

- NEVER fetch data in client components (`'use client'`)
- NEVER use Route Handlers (`src/app/api/`) for data fetching
- NEVER use `useEffect` + `fetch` patterns
- NEVER use SWR, React Query, or any client-side data fetching library
- Server Components can `async/await` directly — use this

## Data Helper Functions

**ALL database queries MUST live in helper functions inside the `/src/data/` directory.**

- One file per domain (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`)
- Server Components import and call these helpers — they do not query the DB directly
- Helper functions use **Drizzle ORM** exclusively — NEVER write raw SQL

```ts
// src/data/workouts.ts  ✅ correct
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function getWorkoutsForDate(userId: string, date: string) {
  return db.select().from(workouts).where(
    and(eq(workouts.userId, userId), eq(workouts.date, date))
  )
}
```

```ts
// Inside a Server Component  ✅ correct
import { getWorkoutsForDate } from '@/data/workouts'

export default async function Page() {
  const data = await getWorkoutsForDate(userId, date)
}
```

```ts
// ❌ wrong — raw SQL
await db.execute('SELECT * FROM workouts WHERE user_id = $1', [userId])

// ❌ wrong — query inside a client component
'use client'
useEffect(() => { fetch('/api/workouts') }, [])

// ❌ wrong — query directly inside a Server Component (bypass /data)
const data = await db.select().from(workouts).where(...)
```

## User Data Isolation — CRITICAL

**A logged-in user must ONLY ever be able to access their own data.**

Every helper function that returns user-owned data MUST:

1. Accept `userId` as a parameter — never read it from a global or session inside the helper
2. Always include `eq(table.userId, userId)` in the WHERE clause
3. Never return data without filtering by `userId`

```ts
// ✅ correct — userId is always scoped into the query
export async function getWorkoutsForDate(userId: string, date: string) {
  return db.select().from(workouts).where(
    and(eq(workouts.userId, userId), eq(workouts.date, date))
  )
}
```

```ts
// ❌ wrong — missing userId filter, exposes all users' data
export async function getWorkoutsForDate(date: string) {
  return db.select().from(workouts).where(eq(workouts.date, date))
}
```

The `userId` passed to every helper must come from `await auth()` (Clerk) in the Server Component, never from user-controlled input such as URL params or request bodies.

```ts
// ✅ correct — userId sourced from Clerk auth, not from the URL
const { userId } = await auth()
if (!userId) redirect('/sign-in')
const data = await getWorkoutsForDate(userId, date)
```
