import { NextResponse } from 'next/server'
import { PersonioClient } from '../../../../lib/personio'

// Initialize Personio client with environment variables
const personioClient = new PersonioClient({
  clientId: process.env.PERSONIO_CLIENT_ID!,
  clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
});

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false' // defaults to true if not specified

    // Get projects using the new PersonioClient
    const projects = await personioClient.getProjects(activeOnly);

    // Transform the response to match the existing format
    const transformedProjects = projects.map(project => ({
      id: project.ID,
      name: project.Name,
      active: project.Active,
      createdAt: project.CreatedAt,
      updatedAt: project.UpdatedAt,
    }));

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}