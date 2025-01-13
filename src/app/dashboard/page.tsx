'use client';

import { Card } from '@/components/ui/card';
import {
  Activity,
  Users,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Reports',
      value: '128',
      icon: FileText,
      trend: '+12.5%',
    },
    {
      title: 'Active Projects',
      value: '24',
      icon: Activity,
      trend: '+4.2%',
    },
    {
      title: 'Team Members',
      value: '12',
      icon: Users,
      trend: '0%',
    },
    {
      title: 'Hours Tracked',
      value: '1,284',
      icon: Clock,
      trend: '+8.1%',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Monthly Report Generated',
      time: '2 hours ago',
      icon: CheckCircle,
    },
    {
      id: 2,
      title: 'New Project Added',
      time: '4 hours ago',
      icon: TrendingUp,
    },
    {
      id: 3,
      title: 'Team Meeting Notes',
      time: 'Yesterday',
      icon: FileText,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-sm text-primary">{stat.trend}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.title}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Recent Activities</h2>
          <div className="space-y-6">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <Icon className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 text-left rounded-lg border border-border hover:border-primary transition-colors">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Create Report</p>
              <p className="text-sm text-muted-foreground">Generate new reports</p>
            </button>
            <button className="p-4 text-left rounded-lg border border-border hover:border-primary transition-colors">
              <Users className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium text-foreground">Team Overview</p>
              <p className="text-sm text-muted-foreground">View team status</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}