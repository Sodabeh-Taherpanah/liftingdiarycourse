'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createWorkoutAction } from '../actions'

export function CreateWorkoutForm() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const nowLocal = format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [startedAt, setStartedAt] = useState(nowLocal)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const { date: savedDate } = await createWorkoutAction({ title, date, startedAt })
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

      {error && (
        <p className='text-sm text-red-500'>{error}</p>
      )}

      <div className='flex gap-3'>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Creating…' : 'Create Workout'}
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
