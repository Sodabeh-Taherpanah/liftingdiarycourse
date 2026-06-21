# Data Mutation Standards

## Data Helper Functions

**ALL database mutations MUST live in helper functions inside the `/src/data/` directory.**

- One file per domain (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`)
- Helper functions use **Drizzle ORM** exclusively — NEVER write raw SQL
- Server Actions import and call these helpers — they do not call the DB directly

```ts
// src/data/workouts.ts  ✅ correct
import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createWorkout(userId: string, date: string, name: string) {
  return db.insert(workouts).values({ userId, date, name }).returning()
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db.delete(workouts).where(
    and(eq(workouts.id, workoutId), eq(workouts.userId, userId))
  )
}
```

```ts
// ❌ wrong — raw SQL mutation
await db.execute('INSERT INTO workouts (user_id, name) VALUES ($1, $2)', [userId, name])

// ❌ wrong — DB call directly inside a Server Action (bypass /data)
await db.insert(workouts).values({ userId, date, name })
```

## Server Actions

**ALL mutations MUST be triggered via Server Actions.**

- Server Actions MUST live in colocated `actions.ts` files, next to the route or component that uses them (e.g. `src/app/workouts/actions.ts`)
- NEVER use Route Handlers (`src/app/api/`) for mutations
- Every `actions.ts` file MUST begin with `'use server'`

```ts
// src/app/workouts/actions.ts  ✅ correct
'use server'

export async function createWorkoutAction(...) { ... }
```

```ts
// ❌ wrong — mutation inside a Route Handler
// src/app/api/workouts/route.ts
export async function POST(req: Request) {
  await db.insert(workouts).values(...)
}
```

## Typed Parameters — No FormData

**Server Action parameters MUST be explicitly typed. `FormData` is NEVER an acceptable parameter type.**

- Define an explicit TypeScript type or interface for every action's inputs
- Extract values from forms client-side and pass typed objects to the action

```ts
// ✅ correct — typed params
export async function createWorkoutAction(params: {
  date: string
  name: string
}) { ... }
```

```ts
// ❌ wrong — FormData parameter
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name')
  ...
}
```

## Zod Validation — Required in Every Server Action

**ALL Server Actions MUST validate their arguments with Zod before doing anything else.**

- Define a Zod schema at the top of the file (or imported from a shared `schemas.ts`)
- Call `.parse()` or `.safeParse()` at the start of every action — never trust the caller
- Throw or return an error immediately if validation fails

```ts
// src/app/workouts/actions.ts  ✅ correct
'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createWorkout } from '@/data/workouts'

const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  name: z.string().min(1).max(100),
})

export async function createWorkoutAction(params: {
  date: string
  name: string
}) {
  const { date, name } = createWorkoutSchema.parse(params)

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return createWorkout(userId, date, name)
}
```

```ts
// ❌ wrong — no validation, raw params used directly
export async function createWorkoutAction(params: { date: string; name: string }) {
  const { userId } = await auth()
  return createWorkout(userId, params.date, params.name)
}
```

## User Data Isolation — CRITICAL

Every mutation helper in `/src/data/` that touches user-owned rows MUST:

1. Accept `userId` as a parameter — never read it inside the helper from auth or a global
2. Always include `eq(table.userId, userId)` in the `WHERE` clause of any `UPDATE` or `DELETE`
3. Always write `userId` into the row on `INSERT`

The `userId` used in every Server Action MUST come from `await auth()` (Clerk), never from the client-supplied params.

```ts
// ✅ correct — userId always comes from Clerk, scoped into every query
const { userId } = await auth()
if (!userId) throw new Error('Unauthenticated')
await deleteWorkout(userId, params.workoutId)
```

```ts
// ❌ wrong — userId taken from the client, allowing any user to delete any row
export async function deleteWorkoutAction(params: { userId: string; workoutId: string }) {
  await deleteWorkout(params.userId, params.workoutId)
}
```

## Redirects — Client Side Only

**NEVER call `redirect()` inside a Server Action.** Redirects must be done client-side after the action resolves.

`redirect()` works by throwing a special error mid-action. This makes the happy path and error path hard to distinguish in the calling component, and the error must be explicitly re-thrown from any `try/catch` or the redirect silently fails.

Instead, return enough data from the action for the client to navigate:

```ts
// ✅ correct — action returns data, client navigates
export async function createWorkoutAction(params: { date: string; title: string }) {
  // ... validate, auth, insert ...
  return { date }
}
```

```tsx
// ✅ correct — client calls router.push() after the action resolves
const { date } = await createWorkoutAction(params)
router.push(`/dashboard?date=${date}`)
```

```ts
// ❌ wrong — redirect() inside a Server Action
export async function createWorkoutAction(params: { date: string; title: string }) {
  // ... validate, auth, insert ...
  redirect(`/dashboard?date=${params.date}`)
}
```
