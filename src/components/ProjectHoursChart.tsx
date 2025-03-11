import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import { ScrollArea } from "../components/ui/scroll-area";
import { getClientCache, setClientCache, clearClientCache, CACHE_DURATIONS } from '../lib/clientCache';
import { Button } from '../components/ui/button';
import { MonthYearPicker } from '../components/ui/month-year-picker';
import { format, startOfMonth } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

interface ProjectHours {
  name: string;
  hours: number;
}

// Generate array of 25 chart color variables
const COLORS = Array.from({ length: 25 }, (_, i) => `hsl(var(--chart-${i + 1}))`);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border border-border">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`${payload[0].value.toFixed(1)} hours`}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;

  return (
    <ScrollArea className="h-[200px] w-full pr-4">
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm truncate">
              {entry.value} ({entry.payload.hours.toFixed(1)} hrs)
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

const CACHE_KEY = 'project-hours-chart';

export function ProjectHoursChart() {
  const [data, setData] = useState<ProjectHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfMonth(new Date()));

  const fetchProjectHours = useCallback(async (skipCache = false) => {
    try {
      setIsRefreshing(true);
      
      // Create cache key with selected month
      const cacheKey = `${CACHE_KEY}-${format(selectedDate, 'yyyy-MM')}`;
      
      // Check client cache first if not skipping cache
      if (!skipCache) {
        const cachedData = getClientCache<ProjectHours[]>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
      } else {
        // Clear cache if explicitly refreshing
        clearClientCache(cacheKey);
      }

      const response = await fetch(`/api/dashboard/project-hours?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project hours');
      }
      const projectHours = await response.json();
      // Sort projects by hours in descending order
      const sortedData = projectHours.sort((a: ProjectHours, b: ProjectHours) => b.hours - a.hours);
      
      // Store in client cache with current month duration
      setClientCache(cacheKey, sortedData, CACHE_DURATIONS.CURRENT_MONTH);
      
      setData(sortedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching project hours:', error);
      setError('Failed to load project hours');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchProjectHours();
  }, [fetchProjectHours]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const totalHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0);
  }, [data]);

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Project Hours Distribution</CardTitle>
          <CardDescription>Current Month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Project Hours Distribution</CardTitle>
          <CardDescription>Current Month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>Project Hours Distribution</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed ml-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <MonthYearPicker
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchProjectHours(true)}
            disabled={isRefreshing}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Project hours overview and distribution</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="hours"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalHours.toFixed(1)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Hours
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-4">
          <div className="font-medium mt-6">Project Breakdown</div>
          <CustomLegend payload={data.map((entry, index) => ({
            value: entry.name,
            color: COLORS[index % COLORS.length],
            payload: entry
          }))} />
        </div>
      </CardContent>
      <CardContent className="flex-col gap-2 text-sm pt-0">
        <div className="flex items-center gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
          Project Hours Overview
        </div>
        <div className="leading-none text-muted-foreground">
          Total hours tracked this month
        </div>
      </CardContent>
    </Card>
  );
} 