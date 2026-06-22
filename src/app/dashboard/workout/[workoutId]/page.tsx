import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getWorkoutById } from '@/data/workouts'
import { EditWorkoutForm } from './_components/EditWorkoutForm'

export default async function EditWorkoutPage(props: {
  params: Promise<{ workoutId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { workoutId } = await props.params
  const workout = await getWorkoutById(userId, workoutId)
  if (!workout) redirect('/dashboard')

  return (
    <main className='max-w-5xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-8'>Edit Workout</h1>
      <EditWorkoutForm workout={workout} />
    </main>
  )
}
