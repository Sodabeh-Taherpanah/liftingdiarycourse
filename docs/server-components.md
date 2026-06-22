# Server Components Standards

## Async by Default

Server Components can `async/await` directly. Always make page and layout components `async` — there is no reason to avoid it.

```ts
// ✅ correct
export default async function WorkoutPage() {
  const data = await getWorkoutById(userId, workoutId)
}
```

## Params and SearchParams MUST Be Awaited

**`params` and `searchParams` are Promises in this project. You MUST `await` them before accessing any property.**

Synchronous access will throw at runtime. This is a hard requirement — never destructure `params` directly from `props`.

```ts
// ✅ correct — await params before use
export default async function EditWorkoutPage(props: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await props.params
}
```

```ts
// ✅ correct — await searchParams before use
export default async function DashboardPage(props: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await props.searchParams
}
```

```ts
// ❌ wrong — synchronous destructure will throw at runtime
export default async function EditWorkoutPage({ params }: {
  params: { workoutId: string }
}) {
  const { workoutId } = params // runtime error
}
```

## Type Signatures for Dynamic Routes

Always type `params` and `searchParams` as `Promise<...>` in the component props. Use `npx next typegen` to auto-generate accurate `PageProps` and `LayoutProps` types after adding a new dynamic route.

```ts
// Dynamic route page — [workoutId]/page.tsx
export default async function Page(props: {
  params: Promise<{ workoutId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { workoutId } = await props.params
}
```

## Auth Before Data

Always check authentication before fetching any data. The order must be:
1. `await auth()` — get userId
2. Guard with `redirect('/sign-in')` if no userId
3. `await params` — get route params
4. Fetch data, passing userId from Clerk (never from params)

```ts
// ✅ correct order
export default async function Page(props: {
  params: Promise<{ workoutId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { workoutId } = await props.params
  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) redirect('/dashboard')

  return <EditWorkoutForm workout={workout} />
}
```

## No Data Fetching in Client Components

Server Components own all data fetching. Client Components receive data as props.

```ts
// ✅ correct — Server Component fetches, passes data down
export default async function Page() {
  const workout = await getWorkoutById(userId, workoutId)
  return <EditWorkoutForm workout={workout} />  // client component receives data
}
```

```ts
// ❌ wrong — client component fetching data
'use client'
export function EditWorkoutForm({ workoutId }: { workoutId: string }) {
  const [workout, setWorkout] = useState(null)
  useEffect(() => { fetch(`/api/workouts/${workoutId}`) }, []) // never do this
}
```
