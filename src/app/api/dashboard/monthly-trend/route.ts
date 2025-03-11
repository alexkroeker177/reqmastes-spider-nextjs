import { NextRequest, NextResponse } from 'next/server';
import { PersonioClient } from '../../../../lib/personio';
import { format, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { getCachedData, setCachedData, CACHE_DURATIONS } from '../../../../lib/cache';

// Create separate cache keys for each month to allow different expiration times
const getMonthCacheKey = (monthIndex: number) => `monthly-trend-month-${monthIndex}`;
const COMBINED_CACHE_KEY = 'monthly-trend-combined';

export async function GET(req: NextRequest) {
  try {
    // Check if we have a combined cache first
    const cachedCombinedData = getCachedData(COMBINED_CACHE_KEY);
    if (cachedCombinedData) {
      return NextResponse.json(cachedCombinedData);
    }

    const personioClient = new PersonioClient({
      clientId: process.env.PERSONIO_CLIENT_ID!,
      clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
    });

    // Get all external projects ONCE (not for each month)
    const projects = await personioClient.getProjects(true);
    const externalProjects = projects.filter(
      project => project.Name && project.Name.startsWith("_ext") && !project.Name.includes("RDA")
    );
    
    const currentDate = new Date();
    
    // Process each month, potentially in parallel
    // Start from 1 month ago (index 1) to 6 months ago (index 6)
    const monthlyDataPromises = Array.from({ length: 6 }, async (_, i) => {
      const monthIndex = i + 1; // 1 = previous month, 6 = six months ago
      const monthDate = subMonths(currentDate, monthIndex);
      
      // Check if we have cached data for this specific month
      const monthCacheKey = getMonthCacheKey(monthIndex);
      const cachedMonthData = getCachedData(monthCacheKey);
      
      if (cachedMonthData) {
        return cachedMonthData;
      }
      
      // Determine appropriate cache duration based on month age
      let cacheDuration;
      if (monthIndex === 1) {
        // Previous month - medium cache
        cacheDuration = CACHE_DURATIONS.PREVIOUS_MONTH;
      } else {
        // Older months - long cache
        cacheDuration = CACHE_DURATIONS.OLDER_MONTHS;
      }
      
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Calculate total hours for all external projects in this month
      // Process projects in parallel for each month
      const projectPromises = externalProjects.map(async (project) => {
        const attendances = await personioClient.getAttendances(
          project.ID,
          format(monthStart, 'yyyy-MM-dd'),
          format(monthEnd, 'yyyy-MM-dd'),
          true
        );
        return attendances.reduce((sum, attendance) => sum + attendance.DurationNet, 0);
      });
      
      // Wait for all project hour calculations to complete
      const projectHours = await Promise.all(projectPromises);
      const monthlyHours = projectHours.reduce((sum, hours) => sum + hours, 0);

      const monthData = {
        month: format(monthDate, 'MMM yyyy', { locale: de }),
        hours: Number(monthlyHours.toFixed(1))
      };
      
      // Cache this month's data with appropriate duration
      setCachedData(monthCacheKey, monthData, cacheDuration);
      
      return monthData;
    });
    
    // Wait for all months to be processed
    const monthlyData = await Promise.all(monthlyDataPromises);
    
    // Reverse the array to have the most recent month first
    const sortedMonthlyData = monthlyData.reverse();
    
    // Cache the combined result with a shorter duration
    setCachedData(COMBINED_CACHE_KEY, sortedMonthlyData, CACHE_DURATIONS.CURRENT_MONTH);

    return NextResponse.json(sortedMonthlyData);
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly trend' },
      { status: 500 }
    );
  }
} 