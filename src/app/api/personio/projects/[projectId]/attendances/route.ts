import { NextResponse } from 'next/server'
import { personioRequest } from '@/lib/personio'
import { AttendanceResponse, Attendance } from '@/types/personio'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const cookieStore = await cookies()
    const personioToken = cookieStore.get('personio_access_token')

    if (!personioToken?.value) {
        return NextResponse.redirect(new URL('/api/auth/personio', request.url))
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    const attendances = await personioRequest<AttendanceResponse[]>('v1/company/attendances', {
      params: {
        project_id: params.projectId,
        start_date: startDate,
        end_date: endDate,
      },
      headers: {
        'Authorization': `Bearer ${personioToken.value}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    // Transform the response data
    const transformedAttendances: Attendance[] = attendances.map(attendance => ({
      id: attendance.id,
      date: attendance.attributes.date,
      duration: attendance.attributes.duration,
      breakDuration: attendance.attributes.break_duration,
      projectId: attendance.attributes.project_id,
      employeeId: attendance.attributes.employee_id,
      comment: attendance.attributes.comment,
    }))

    return NextResponse.json(transformedAttendances)
  } catch (error) {
    // Check for authentication errors
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Personio authentication expired' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attendances' },
      { status: 500 }
    )
  }
}