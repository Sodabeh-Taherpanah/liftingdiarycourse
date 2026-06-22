'use server'

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { updateWorkout } from '@/data/workouts'

const updateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  title: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startedAt: z.string(),
  completedAt: z.string().optional(),
})

export async function updateWorkoutAction(params: {
  workoutId: string
  title: string
  date: string
  startedAt: string
  completedAt?: string
}) {
  const { workoutId, title, date, startedAt, completedAt } = updateWorkoutSchema.parse(params)

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  await updateWorkout(userId, workoutId, {
    title,
    date,
    startedAt: new Date(startedAt),
    completedAt: completedAt ? new Date(completedAt) : null,
  })

  return { date }
}
