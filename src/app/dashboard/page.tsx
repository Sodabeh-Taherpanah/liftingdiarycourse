import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { format, parse } from 'date-fns'
import { WorkoutCard } from './_components/WorkoutCard'
import { DatePickerClient } from './_components/DatePickerClient'
import { getWorkoutsForDate } from '@/data/workouts'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { date: dateParam } = await searchParams
  const dateString = dateParam ?? format(new Date(), 'yyyy-MM-dd')
  const selectedDate = parse(dateString, 'yyyy-MM-dd', new Date())

  const workoutList = await getWorkoutsForDate(userId, dateString)
  const formattedDate = format(selectedDate, 'do MMM yyyy')

  return (
    <main className='max-w-5xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-8'>Workout Dashboard</h1>

      <div className='grid grid-cols-[auto_1fr] gap-10 items-start'>
        <div>
          <p className='text-sm font-medium mb-3'>Select Date</p>
          <DatePickerClient selectedDate={selectedDate} />
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-4'>Workouts for {formattedDate}</h2>

          {workoutList.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No workouts logged for this date.</p>
          ) : (
            <ul className='flex flex-col gap-3'>
              {workoutList.map((workout) => (
                <li key={workout.id}>
                  <WorkoutCard
                    id={workout.id}
                    title={workout.title}
                    startedAt={workout.startedAt}
                    completedAt={workout.completedAt}
                    workoutExercises={workout.workoutExercises}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
