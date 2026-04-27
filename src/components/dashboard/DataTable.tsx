import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@/hooks/useDashboardData';

interface DataTableProps {
  transactions?: Transaction[];
  isLoading: boolean;
}

export function DataTable({ transactions, isLoading }: DataTableProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12 hidden md:block" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Latest customer purchases and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* We use overflow-x-auto to ensure the table scrolls horizontally on mobile devices */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((tx) => (
                <TableRow key={tx.id} className="group">
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.user}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.status === 'Completed'
                          ? 'default'
                          : tx.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none' : ''
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
