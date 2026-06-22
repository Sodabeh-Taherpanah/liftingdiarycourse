'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Workout } from '@/db/schema'
import { updateWorkoutAction } from '../actions'

export function EditWorkoutForm({ workout }: { workout: Workout }) {
  const [title, setTitle] = useState(workout.title)
  const [date, setDate] = useState(workout.date)
  const [startedAt, setStartedAt] = useState(format(workout.startedAt, "yyyy-MM-dd'T'HH:mm"))
  const [completedAt, setCompletedAt] = useState(
    workout.completedAt ? format(workout.completedAt, "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const { date: savedDate } = await updateWorkoutAction({
          workoutId: workout.id,
          title,
          date,
          startedAt,
          completedAt: completedAt || undefined,
        })
        router.push(`/dashboard?date=${savedDate}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 max-w-md'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='title'>Workout Title</Label>
        <Input
          id='title'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder='e.g. Upper Body Push'
          required
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='date'>Date</Label>
        <Input
          id='date'
          type='date'
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='startedAt'>Started At</Label>
        <Input
          id='startedAt'
          type='datetime-local'
          value={startedAt}
          onChange={e => setStartedAt(e.target.value)}
          required
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='completedAt'>Completed At (optional)</Label>
        <Input
          id='completedAt'
          type='datetime-local'
          value={completedAt}
          onChange={e => setCompletedAt(e.target.value)}
        />
      </div>

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <div className='flex gap-3'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
