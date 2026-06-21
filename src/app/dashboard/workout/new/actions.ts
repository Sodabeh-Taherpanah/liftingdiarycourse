'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createWorkout } from '@/data/workouts'

// TODO(human): Define the Zod schema here.
// It should validate: title (string), date (string in yyyy-MM-dd format), startedAt (string, ISO datetime)
// Consider: min/max lengths for title, regex for date format, and how strictly to validate startedAt.
const createWorkoutSchema = z.object({
  title: z.string(),
  date: z.string(),
  startedAt: z.string(),
})

export async function createWorkoutAction(params: {
  title: string
  date: string
  startedAt: string
}) {
  const { title, date, startedAt } = createWorkoutSchema.parse(params)

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  await createWorkout(userId, {
    title,
    date,
    startedAt: new Date(startedAt),
  })

  return { date }
}
