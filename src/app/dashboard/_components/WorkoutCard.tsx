import { format, differenceInMinutes } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Exercise {
  name: string
  category: 'compound' | 'isolation'
}

interface WorkoutExercise {
  id: string
  exercise: Exercise
}

export interface WorkoutCardProps {
  id: string
  title: string
  startedAt: Date
  completedAt: Date | null
  workoutExercises: WorkoutExercise[]
}

export function WorkoutCard({ title, startedAt, completedAt, workoutExercises }: WorkoutCardProps) {
  const duration = completedAt ? differenceInMinutes(completedAt, startedAt) : null

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between pb-2'>
        <CardTitle className='text-base font-semibold'>{title}</CardTitle>
        <span className='text-xs text-muted-foreground pt-0.5'>
          {format(startedAt, 'h:mm aa')}
        </span>
      </CardHeader>

      <CardContent className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-1.5'>
          {workoutExercises.map((we) => (
            <Badge key={we.id} variant='secondary'>
              {we.exercise.name}
            </Badge>
          ))}
        </div>

        {duration !== null && (
          <p className='text-xs text-muted-foreground'>Duration: {duration} min</p>
        )}
      </CardContent>
    </Card>
  )
}
