import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CreateWorkoutForm } from './_components/CreateWorkoutForm'

export default async function NewWorkoutPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <main className='max-w-5xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-8'>New Workout</h1>
      <CreateWorkoutForm />
    </main>
  )
}
