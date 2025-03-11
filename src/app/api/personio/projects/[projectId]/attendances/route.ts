import { NextResponse } from 'next/server'
import { PersonioClient } from '../../../../../../lib/personio'

// Initialize Personio client with environment variables
const personioClient = new PersonioClient({
  clientId: process.env.PERSONIO_CLIENT_ID!,
  clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
});

export async function GET(request: Request) {
  try {
    // Get projectId from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[pathParts.indexOf('projects') + 1];
    
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const confirmed = url.searchParams.get('confirmed') === 'true'

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Get attendances using the new PersonioClient
    const attendances = await personioClient.getAttendances(
      parseInt(projectId),
      startDate,
      endDate,
      confirmed
    );

    // Get employees to include names in the response
    const employees = await personioClient.getEmployees();

    // Transform the response data with employee names
    const transformedAttendances = await Promise.all(attendances.map(async (attendance) => ({
      id: attendance.Employee, // Using Employee ID as the attendance ID
      date: attendance.Date,
      startTime: attendance.StartTime,
      endTime: attendance.EndTime,
      duration: attendance.DurationNet,
      break: attendance.Break,
      projectId: attendance.Project,
      employeeId: attendance.Employee,
      employeeName: await personioClient.getEmployeeNameFromID(attendance.Employee, employees),
      comment: attendance.Comment,
    })));

    return NextResponse.json(transformedAttendances)
  } catch (error) {
    console.error('Error fetching attendances:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attendances' },
      { status: 500 }
    )
  }
}