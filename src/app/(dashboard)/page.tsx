'use client';

import React, { useEffect } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { StatCards } from '@/components/dashboard/StatCards';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { DataTable } from '@/components/dashboard/DataTable';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data, error, isLoading, isError, isFetching, refetch } = useDashboardData();

  useEffect(() => {
    if (isError) {
      // @ts-ignore - showing the exact error for debugging
      const errorMsg = error?.response?.data?.detail || error?.message || 'Check console for details';
      toast.error(`Dashboard Error: ${errorMsg}. Please check your Django backend views!`);
    }
  }, [isError, error]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, here is your total order overview
          </p>
        </div>

      </div>
      
      {/* 
        Using a standard responsive grid system approach
        Lenis handles smooth scroll on this container implicitly since we wrapped the layout
      */}
      <div className="space-y-6">
        <StatCards stats={data?.stats} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="col-span-1 lg:col-span-8"
          >
            <ChartComponent data={data?.chartData} isLoading={isLoading} />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="col-span-1 lg:col-span-4"
          >
             <DataTable transactions={data?.transactions} isLoading={isLoading} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
