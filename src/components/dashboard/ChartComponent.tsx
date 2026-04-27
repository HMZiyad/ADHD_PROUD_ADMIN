'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ChartDataPoint } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#3B82F6",
  },
} satisfies ChartConfig;

interface ChartComponentProps {
  data?: ChartDataPoint[];
  isLoading: boolean;
}

export function ChartComponent({ data, isLoading }: ChartComponentProps) {
  if (isLoading) {
    return (
      <Card className="h-full shadow-sm border-0 ring-1 ring-black/5">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-end justify-between gap-4 px-4">
             {/* Simple visual placeholder for the bar chart */}
             {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <Skeleton key={i} className="w-full max-w-[40px] rounded-t-sm" style={{ height: `${h}%` }} />
             ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm border-0 ring-1 ring-black/5">
      <CardHeader>
        <CardTitle className="font-medium text-lg">Total Orders last month</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
           <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            barSize={32}
          >
            <CartesianGrid vertical={false} strokeDasharray="1" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tickMargin={12} 
              fontSize={12}
              tick={{ fill: '#6B7280' }}
            />
            {/* The YAxis is visually useful, styling exactly as the mock (0, 8, 16, 24, 32, 40) */}
            <YAxis 
               tickLine={false} 
               axisLine={false} 
               tickFormatter={(value) => `${value}`} 
               fontSize={12}
               tick={{ fill: '#6B7280' }}
               ticks={[0, 8, 16, 24, 32, 40]}
               domain={[0, 40]}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="orders"
              fill="var(--color-orders)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
