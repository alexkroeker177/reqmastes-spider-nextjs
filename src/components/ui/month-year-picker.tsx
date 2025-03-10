'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, setMonth, setYear } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MonthYearPickerProps {
  value?: Date  
  onChange: (date: Date | undefined) => void
  initialDate?: Date
}

export function MonthYearPicker({ value, onChange, initialDate }: MonthYearPickerProps) {
  // Initialize with start of month
  const initializeDate = (inputDate: Date | undefined) => {
    const baseDate = inputDate || new Date();
    return startOfMonth(baseDate);
  };

  const date = value || initializeDate(initialDate);

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr)
    const newDate = startOfMonth(setMonth(date, month))
    onChange(newDate)
  }

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr)
    const newDate = startOfMonth(setYear(date, year))
    onChange(newDate)
  }

  const handlePrevYear = () => {
    const newDate = startOfMonth(setYear(date, date.getFullYear() - 1))
    onChange(newDate)
  }

  const handleNextYear = () => {
    const newDate = startOfMonth(setYear(date, date.getFullYear() + 1))
    onChange(newDate)
  }

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevYear}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{date.getFullYear()}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select onValueChange={handleMonthChange} value={date.getMonth().toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {format(setMonth(new Date(), i), 'MMMM')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleYearChange} value={date.getFullYear().toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i
              return (
                <SelectItem key={i} value={year.toString()}>
                  {year}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

