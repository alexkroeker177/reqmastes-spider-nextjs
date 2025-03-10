import { useState } from 'react'

export function useMonthYearPicker(initialDate = new Date()) {
  const [date, setDate] = useState(initialDate)

  const setMonth = (month: number) => {
    const newDate = new Date(date)
    newDate.setMonth(month)
    setDate(newDate)
  }

  const setYear = (year: number) => {
    const newDate = new Date(date)
    newDate.setFullYear(year)
    setDate(newDate)
  }

  const nextYear = () => {
    const newDate = new Date(date)
    newDate.setFullYear(date.getFullYear() + 1)
    setDate(newDate)
  }

  const prevYear = () => {
    const newDate = new Date(date)
    newDate.setFullYear(date.getFullYear() - 1)
    setDate(newDate)
  }

  return {
    date,
    setMonth,
    setYear,
    nextYear,
    prevYear,
  }
}

