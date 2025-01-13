import { useState } from 'react'

export function useMonthYearPicker(initialDate = new Date()) {
  const [date, setDate] = useState(initialDate)

  const setMonth = (month: number) => {
    setDate(new Date(date.getFullYear(), month))
  }

  const setYear = (year: number) => {
    setDate(new Date(year, date.getMonth()))
  }

  const nextYear = () => {
    setDate(new Date(date.getFullYear() + 1, date.getMonth()))
  }

  const prevYear = () => {
    setDate(new Date(date.getFullYear() - 1, date.getMonth()))
  }

  return {
    date,
    setMonth,
    setYear,
    nextYear,
    prevYear,
  }
}

