'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { DatePicker } from './DatePicker'

export function DatePickerClient({ selectedDate }: { selectedDate: Date }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleDateChange(date: Date) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(date, 'yyyy-MM-dd'))
    router.push(`?${params.toString()}`)
  }

  return <DatePicker date={selectedDate} onDateChange={handleDateChange} />
}
