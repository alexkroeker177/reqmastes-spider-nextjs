import { NextRequest, NextResponse } from 'next/server';
import { PersonioClient } from '@/lib/personio';
import { renderToBuffer } from '@react-pdf/renderer';
import ProjectReport from '@/components/ProjectReport';
import React from 'react';
import { endOfMonth, startOfMonth, eachDayOfInterval } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate, project } = await req.json();
    console.log('Received dates:', { startDate, endDate, project });

    // Initialize Personio client
    const personioClient = new PersonioClient({
      clientId: process.env.PERSONIO_CLIENT_ID!,
      clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
    });

    // Get all projects and filter external ones if no specific projects provided
    const projects = project || (await personioClient.getProjects(true))
      .filter(p => p.Name && p.Name.startsWith("_ext") && !p.Name.includes("RDA"))
      .map(p => p.Name);

    console.log('Projects to process:', projects);

    const projectData = [];
    
    // Parse dates and ensure we're using the correct month
    const selectedDate = new Date(startDate);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = monthEnd.getDate();

    console.log('Date range:', {
      selectedDate: selectedDate.toISOString(),
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      daysInMonth
    });
    
    // Fetch data for each project
    for (const projectName of projects) {
      const projectId = await personioClient.getProjectIdByName(projectName);
      if (!projectId) {
        console.log('No project ID found for:', projectName);
        continue;
      }

      console.log('Fetching attendances for project:', projectName, projectId);
      const attendances = await personioClient.getAttendances(
        projectId,
        monthStart.toISOString().split('T')[0],
        monthEnd.toISOString().split('T')[0],
        true
      );

      console.log('Received attendances:', attendances.length);

      // Process attendance data
      const hoursPerDay = Array(daysInMonth).fill(0);
      let projectTotalHours = 0;

      attendances.forEach(attendance => {
        const attendanceDate = new Date(attendance.Date);
        const day = attendanceDate.getDate();
        
        if (attendanceDate >= monthStart && attendanceDate <= monthEnd) {
          hoursPerDay[day - 1] += attendance.DurationNet;
          projectTotalHours += attendance.DurationNet;
        }
      });

      console.log('Hours for project:', projectName, {
        hoursPerDay,
        projectTotalHours
      });

      projectData.push({
        name: projectName.substring(5),
        hours: hoursPerDay,
        totalHours: projectTotalHours,
      });
    }

    // Calculate total hours per day
    const totalHoursPerDay = Array(daysInMonth).fill(0);
    let totalMonthHours = 0;

    projectData.forEach(project => {
      project.hours.forEach((hours, day) => {
        totalHoursPerDay[day] += hours;
        totalMonthHours += hours;
      });
    });

    console.log('Final data:', {
      projectData,
      totalHoursPerDay,
      totalMonthHours,
      daysInMonth
    });

    // Generate PDF
    const reportProps = {
      projects: projectData,
      startDate: monthStart,
      endDate: monthEnd,
      totalHoursPerDay,
      totalMonthHours,
      daysInMonth,
    };

    // Create PDF buffer directly using the component
    // @ts-expect-error - Known type issue with react-pdf
    const pdfBuffer = await renderToBuffer(React.createElement(ProjectReport, reportProps));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=projekterfassung.pdf',
      },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 