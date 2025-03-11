import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { format, subMonths } from 'date-fns';
import { getClientCache, setClientCache, clearClientCache, CACHE_DURATIONS } from '../lib/clientCache';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';

interface MonthlyData {
  month: string;
  hours: number;
}

const CACHE_KEY = 'monthly-trend-chart';

export function MonthlyTrendChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMonthlyTrend = async (skipCache = false) => {
    try {
      setIsRefreshing(true);
      
      // Check client cache first if not skipping cache
      if (!skipCache) {
        const cachedData = getClientCache<MonthlyData[]>(CACHE_KEY);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
      } else {
        // Clear cache if explicitly refreshing
        clearClientCache(CACHE_KEY);
      }

      const response = await fetch('/api/dashboard/monthly-trend');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly trend');
      }
      const monthlyData = await response.json();
      
      // Store in client cache with current month duration since this is combined data
      setClientCache(CACHE_KEY, monthlyData, CACHE_DURATIONS.CURRENT_MONTH);
      
      setData(monthlyData);
      setError(null);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      setError('Failed to load monthly trend');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonthlyTrend();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="w-full flex justify-between items-center">
            <CardTitle>Monthly Hours Trend</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              disabled={true}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="w-full flex justify-between items-center">
            <CardTitle>Monthly Hours Trend</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchMonthlyTrend(true)}
              disabled={isRefreshing}
              className={isRefreshing ? 'animate-spin' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="w-full flex justify-between items-center">
          <CardTitle>Monthly Hours Trend</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchMonthlyTrend(true)}
            disabled={isRefreshing}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border border-border">
                      <p className="font-medium">{payload[0].payload.month}</p>
                      <p className="text-sm">{`${payload[0].value} hours`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 