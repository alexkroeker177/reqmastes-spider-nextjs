import { NextRequest, NextResponse } from 'next/server';
import { PersonioClient } from '@/lib/personio';
import { renderToBuffer } from '@react-pdf/renderer';
import MonthlyReport from '../../../../components/MonthlyReport';
import React from 'react';

export async function POST(req: NextRequest) {
  try {
    const { date } = await req.json();

    // Initialize Personio client
    const personioClient = new PersonioClient({
      clientId: process.env.PERSONIO_CLIENT_ID!,
      clientSecret: process.env.PERSONIO_CLIENT_SECRET!,
    });

    const startDate = new Date(date);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const daysInMonth = endDate.getDate();
    
    // Get all projects and filter external ones
    const allProjects = await personioClient.getProjects(true);
    const extProjects = allProjects
      .filter(project => project.Name && project.Name.startsWith("_ext") && !project.Name.includes("RDA"))
      .map(project => project.Name);
    
    const projectData: { name: string; hours: number[]; totalHours: number; }[] = [];
    const totalHoursPerDay = Array(daysInMonth).fill(0);
    let totalMonthHours = 0;

    // Fetch data for each external project
    for (const projectName of extProjects) {
      const projectId = await personioClient.getProjectIdByName(projectName);
      if (!projectId) continue;

      const attendances = await personioClient.getAttendances(
        projectId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        true
      );

      // Process attendance data
      const hoursPerDay = Array(daysInMonth).fill(0);
      let projectTotalHours = 0;

      attendances.forEach(attendance => {
        const day = new Date(attendance.Date).getDate();
        if (day <= daysInMonth) { // Ensure we only count days that exist in this month
          hoursPerDay[day - 1] = attendance.DurationNet;
          projectTotalHours += attendance.DurationNet;
          totalHoursPerDay[day - 1] += attendance.DurationNet;
        }
      });

      totalMonthHours += projectTotalHours;

      projectData.push({
        name: projectName.substring(5),
        hours: hoursPerDay,
        totalHours: projectTotalHours,
      });
    }

    // Generate PDF
    const reportProps = {
      projects: projectData,
      month: startDate,
      totalHoursPerDay,
      totalMonthHours,
      daysInMonth,
    };

    // Create PDF buffer directly using the component
    // @ts-expect-error - Known type issue with react-pdf
    const pdfBuffer = await renderToBuffer(React.createElement(MonthlyReport, reportProps));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=monthly-report.pdf',
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