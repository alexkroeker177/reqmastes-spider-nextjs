import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PersonioProject } from '@/types/personio'

export async function GET(request: Request) {
  try {
    // Get the Personio access token from cookies
    const cookieStore = await cookies()
    const personioToken = cookieStore.get('personio_access_token')

    if (!personioToken?.value) {
      // Redirect to auth endpoint
      return NextResponse.redirect(new URL('/api/auth/personio', request.url))
    }

    // Get query parameters
    const activeOnly = 'true'

    const response = await fetch('https://api.personio.de/v1/company/attendances/projects', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${personioToken.value}`
      },
    })

    // If token is invalid or expired
    if (response.status === 401) {
      cookieStore.delete('personio_access_token')
      return NextResponse.redirect(new URL('/api/auth/personio', request.url))
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to fetch projects')
    }

    const projects = data.data
      .map((project: PersonioProject) => {
        // Validate required fields
        if (!project.attributes.name) {
          throw new Error("Missing field 'name' in response")
        }
        if (!project.attributes.created_at) {
          throw new Error("Missing field 'created_at' in response")
        }
        if (!project.attributes.updated_at) {
          throw new Error("Missing field 'updated_at' in response")
        }

        const projectData = {
          id: Number(project.id),
          name: project.attributes.name,
          active: Boolean(project.attributes.active),
          createdAt: Math.floor(new Date(project.attributes.created_at).getTime() / 1000),
          updatedAt: Math.floor(new Date(project.attributes.updated_at).getTime() / 1000),
        }

        // Filter out inactive projects if activeOnly is true
        if (activeOnly && !projectData.active) {
          return null
        }

        return projectData
      })
      .filter(Boolean) // Remove null values

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}