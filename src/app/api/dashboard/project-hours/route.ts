import { NextRequest, NextResponse } from 'next/server';
import { PersonioClient } from '../../../../lib/personio';
import { startOfMonth, endOfMonth, format, parse } from 'date-fns';
import { getCachedData, setCachedData, CACHE_DURATIONS } from '../../../../lib/cache';

export async function GET(req: NextRequest) {
  try {
    // Get date from query parameters or use current date
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const currentDate = dateParam 
      ? parse(dateParam, 'yyyy-MM-dd', new Date())
      : new Date();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    // Create cache key with month
    const CACHE_KEY = `project-hours-${format(monthStart, 'yyyy-MM')}`;

    // Check cache first
    const cachedData = getCachedData(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const personioClient = new PersonioClient({
      clientId: process.env.PERSONIO_CLIENT_ID!,
      clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
    });

    // Get all external projects
    const projects = await personioClient.getProjects(true);
    const externalProjects = projects.filter(
      project => project.Name && project.Name.startsWith("_ext") && !project.Name.includes("RDA")
    );

    // Fetch hours for each project in parallel
    const projectPromises = externalProjects.map(async (project) => {
      const attendances = await personioClient.getAttendances(
        project.ID,
        format(monthStart, 'yyyy-MM-dd'),
        format(monthEnd, 'yyyy-MM-dd'),
        true
      );

      const totalHours = attendances.reduce((sum, attendance) => sum + attendance.DurationNet, 0);
      
      if (totalHours > 0) {
        return {
          name: project.Name.substring(5),
          hours: totalHours
        };
      }
      return null;
    });
    
    // Wait for all project hour calculations to complete
    const projectHoursResults = await Promise.all(projectPromises);
    
    // Filter out null results and sort by hours
    const projectHours = projectHoursResults
      .filter(result => result !== null)
      .sort((a, b) => b!.hours - a!.hours);

    // Store in cache - current month data should refresh more frequently
    const cacheDuration = format(monthStart, 'yyyy-MM') === format(new Date(), 'yyyy-MM')
      ? CACHE_DURATIONS.CURRENT_MONTH
      : CACHE_DURATIONS.OLDER_MONTHS;

    setCachedData(CACHE_KEY, projectHours, cacheDuration);

    return NextResponse.json(projectHours);
  } catch (error) {
    console.error('Error fetching project hours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project hours' },
      { status: 500 }
    );
  }
} 