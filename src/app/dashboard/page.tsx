'use client';

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { ProjectHoursChart } from '../../components/ProjectHoursChart';
import { MonthlyTrendChart } from '../../components/MonthlyTrendChart';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <ProjectHoursChart />
          <MonthlyTrendChart />
        </div>
      </div>
    </ProtectedRoute>
  );
}