import { NextResponse } from 'next/server'
import { Employee, PersonioEmployee } from '@/types/personio'

export async function GET() {
  try {
    const response = await fetch('https://api.personio.de/v1/company/employees?limit=200', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch employees')
    }

    const employees: Employee[] = data.data.map((employee: PersonioEmployee) => {
      // Validate required fields exist
      if (!employee.attributes.id?.value) {
        throw new Error("Missing field 'id' in response")
      }
      if (!employee.attributes.first_name?.value) {
        throw new Error("Missing field 'first_name' in response")
      }
      if (!employee.attributes.last_name?.value) {
        throw new Error("Missing field 'last_name' in response")
      }

      return {
        id: Number(employee.attributes.id.value),
        firstName: String(employee.attributes.first_name.value),
        lastName: String(employee.attributes.last_name.value),
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}