import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createWorkout(
  userId: string,
  params: { title: string; date: string; startedAt: Date }
) {
  return db.insert(workouts).values({ userId, ...params }).returning()
}

export async function getWorkoutsForDate(userId: string, date: string) {
  return db.query.workouts.findMany({
    where: and(eq(workouts.userId, userId), eq(workouts.date, date)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
        },
      },
    },
  })
}
