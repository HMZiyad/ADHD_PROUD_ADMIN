import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

// --- TS Interfaces ---
export interface StatItem {
  title: string;
  value: string;
  subtext: string;
  icon: string;
}

export interface ChartDataPoint {
  date: string;
  orders: number;
}

export interface Transaction {
  id: string;
  user: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export interface DashboardData {
  stats: StatItem[];
  chartData: ChartDataPoint[];
  transactions: Transaction[];
}

// ── Real API fetcher ──────────────────────────────────────────────────────────
const fetchDashboardData = async (): Promise<DashboardData> => {
  const [statsRaw, chartRaw, txRaw] = await Promise.all([
    adminService.getDashboardStats(),
    adminService.getChartData('week'),
    adminService.getTransactions(5),
  ]);

  const revenue = statsRaw.total_revenue;
  const revenueDisplay =
    revenue >= 1000
      ? `$${(revenue / 1000).toFixed(2)}K`
      : `$${revenue.toFixed(2)}`;

  const stats: StatItem[] = [
    { title: 'Total Orders',   value: String(statsRaw.total_orders),    subtext: 'All orders placed by customers',   icon: 'file-text' },
    { title: 'Total Products', value: String(statsRaw.total_products),  subtext: 'Products available for customers', icon: 'box' },
    { title: 'Total Customer', value: String(statsRaw.total_customers), subtext: 'Customers who placed orders',      icon: 'users' },
    { title: 'Total Revenue',  value: revenueDisplay,                   subtext: 'Total revenue generated',          icon: 'dollar' },
  ];

  return {
    stats,
    chartData: chartRaw,
    transactions: txRaw,
  };
};

export const useDashboardData = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    staleTime: 30_000, // Re-fetch after 30s
  });
};
