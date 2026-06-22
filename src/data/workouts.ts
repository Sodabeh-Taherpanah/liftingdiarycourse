import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createWorkout(
  userId: string,
  params: { title: string; date: string; startedAt: Date }
) {
  return db.insert(workouts).values({ userId, ...params }).returning()
}

export async function getWorkoutById(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  })
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  params: { title: string; date: string; startedAt: Date; completedAt?: Date | null }
) {
  return db.update(workouts)
    .set(params)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
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
