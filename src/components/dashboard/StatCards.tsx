'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Box, FileText, Activity } from 'lucide-react';
import { StatItem } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, Variants } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  'file-text': <FileText className="h-5 w-5 text-blue-500" />,
  box: <Box className="h-5 w-5 text-amber-500" />,
  users: <Users className="h-5 w-5 text-purple-500" />,
  dollar: <DollarSign className="h-5 w-5 text-emerald-500" />,
};

interface StatCardsProps {
  stats?: StatItem[];
  isLoading: boolean;
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats?.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className="shadow-sm border-0 ring-1 ring-black/5 bg-white relative overflow-hidden group">
            {/* Subtle gradient glow effect on hover */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
              <div className="p-0">
                {iconMap[stat.icon] || <Activity className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 flex items-center text-xs">
                <span className="text-muted-foreground">{stat.subtext}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
