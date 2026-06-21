'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { WorkoutCard, type WorkoutCardProps } from './_components/WorkoutCard'

const MOCK_WORKOUTS: WorkoutCardProps[] = [
  {
    id: '1',
    title: 'Upper Body Strength',
    startedAt: new Date('2026-06-21T09:00:00'),
    completedAt: new Date('2026-06-21T09:45:00'),
    workoutExercises: [
      { id: 'we1', exercise: { name: 'Bench Press', category: 'compound' } },
      { id: 'we2', exercise: { name: 'Pull-ups', category: 'compound' } },
      { id: 'we3', exercise: { name: 'Shoulder Press', category: 'compound' } },
    ],
  },
  {
    id: '2',
    title: 'Cardio Session',
    startedAt: new Date('2026-06-21T18:00:00'),
    completedAt: new Date('2026-06-21T18:30:00'),
    workoutExercises: [
      { id: 'we4', exercise: { name: 'Treadmill', category: 'isolation' } },
      { id: 'we5', exercise: { name: 'Rowing', category: 'isolation' } },
    ],
  },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())

  const formattedDate = format(date, 'do MMM yyyy')

  return (
    <main className='max-w-5xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-8'>Workout Dashboard</h1>

      <div className='grid grid-cols-[auto_1fr] gap-10 items-start'>
        <div>
          <p className='text-sm font-medium mb-3'>Select Date</p>
          <Calendar
            mode='single'
            selected={date}
            onSelect={(d) => d && setDate(d)}
            className='rounded-md border border-border'
          />
        </div>

        <div>
          <h2 className='text-lg font-semibold mb-4'>Workouts for {formattedDate}</h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No workouts logged for this date.</p>
          ) : (
            <ul className='flex flex-col gap-3'>
              {MOCK_WORKOUTS.map((workout) => (
                <li key={workout.id}>
                  <WorkoutCard {...workout} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
