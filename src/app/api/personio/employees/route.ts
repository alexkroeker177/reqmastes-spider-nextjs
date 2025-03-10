import { NextResponse } from 'next/server'
import { PersonioClient } from '@/lib/personio'

// Initialize Personio client with environment variables
const personioClient = new PersonioClient({
  clientId: process.env.PERSONIO_CLIENT_ID!,
  clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
});

export async function GET() {
  try {
    // Get employees using the new PersonioClient
    const employees = await personioClient.getEmployees();

    // Transform the response to match the existing format
    const transformedEmployees = employees.map(employee => ({
      id: employee.ID,
      firstName: employee.FirstName,
      lastName: employee.LastName,
    }));

    return NextResponse.json(transformedEmployees)
  } catch (error) {
    console.error('Error fetching employees:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}