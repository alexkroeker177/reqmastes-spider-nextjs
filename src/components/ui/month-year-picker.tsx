'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useMonthYearPicker } from '@/hooks/use-month-year-picker'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MonthYearPickerProps {
  value?: Date  
  onChange: (date: Date) => void
  initialDate?: Date
}

export function MonthYearPicker({ onChange, initialDate }: MonthYearPickerProps) {
  const { date, setMonth, setYear, nextYear, prevYear } = useMonthYearPicker(initialDate)
  const [isOpen, setIsOpen] = useState(false)

  const handleMonthChange = (value: string) => {
    setMonth(parseInt(value))
    onChange(date)
  }

  const handleYearChange = (value: string) => {
    setYear(parseInt(value))
    onChange(date)
  }

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className="flex flex-col items-start space-y-2">
      <Button
        variant="outline"
        onClick={toggleOpen}
        className="w-[240px] justify-start text-left font-normal"
      >
        <span>{format(date, 'MMMM yyyy')}</span>
      </Button>
      {isOpen && (
        <div className="p-2 bg-background border rounded-md shadow-md">
          <div className="flex justify-between items-center mb-2">
            <Button variant="ghost" size="icon" onClick={prevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{date.getFullYear()}</span>
            <Button variant="ghost" size="icon" onClick={nextYear}>
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
                    {format(new Date(0, i), 'MMMM')}
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
      )}
    </div>
  )
}

