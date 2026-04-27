'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, MoreVertical, Eye, Truck, CheckCircle, XCircle, Calendar, Package, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminService, AdminOrder } from '@/services/admin.service';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Shipped:   'bg-gray-100 text-gray-600 border border-gray-200',
  Delivered: 'bg-green-50 text-green-700 border border-green-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const PAGE_SIZE = 10;

// ── Kebab Menu ─────────────────────────────────────────────────────────────────
function OrderMenu({
  order,
  onView,
  onMarkShipped,
  onMarkDelivered,
  onCancel,
}: {
  order: AdminOrder;
  onView: () => void;
  onMarkShipped: () => void;
  onMarkDelivered: () => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-black/5 bg-white shadow-lg py-1 text-sm">
          <button onClick={() => { setOpen(false); onView(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-foreground">
            <Eye className="h-4 w-4 text-muted-foreground" /> View Details
          </button>
          {!isCancelled && order.status !== 'Delivered' && (
            <>
              <button onClick={() => { setOpen(false); onMarkShipped(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-foreground">
                <Truck className="h-4 w-4 text-muted-foreground" /> Mark Shipped
              </button>
              <button onClick={() => { setOpen(false); onMarkDelivered(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-foreground">
                <CheckCircle className="h-4 w-4 text-muted-foreground" /> Mark Delivered
              </button>
            </>
          )}
          {!isCancelled && (
            <>
              <div className="my-1 border-t border-black/5" />
              <button onClick={() => { setOpen(false); onCancel(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-500">
                <XCircle className="h-4 w-4" /> Cancel Order
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-5 py-3 whitespace-nowrap">
          <div className="h-4 bg-muted/60 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ order: AdminOrder; action: 'shipped' | 'delivered' | 'cancel' } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminOrders', page],
    queryFn: () => adminService.getOrders(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: 'Shipped' | 'Delivered' | 'Cancelled' }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setConfirmModal(null);
      toast.success('Order status updated.');
    },
    onError: () => {
      toast.error('Failed to update order status.');
    },
  });

  const orders = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function applyStatus(orderId: string, status: 'Shipped' | 'Delivered' | 'Cancelled') {
    statusMutation.mutate({ orderId, status });
  }

  const confirmConfig = confirmModal ? {
    shipped:   { title: 'Mark as Shipped?',   body: `Mark order ${confirmModal.order.order_number} as Shipped?`, btnLabel: 'Mark Shipped', btnClass: 'bg-blue-500 hover:bg-blue-600 text-white', icon: <Truck className="h-8 w-8 text-blue-500" />, iconBg: 'bg-blue-50 border-blue-100' },
    delivered: { title: 'Mark as Delivered?', body: `Confirm that order ${confirmModal.order.order_number} has been delivered?`, btnLabel: 'Mark Delivered', btnClass: 'bg-green-500 hover:bg-green-600 text-white', icon: <CheckCircle className="h-8 w-8 text-green-500" />, iconBg: 'bg-green-50 border-green-100' },
    cancel:    { title: 'Cancel Order?',      body: `Are you sure you want to cancel order ${confirmModal.order.order_number}? This action cannot be undone.`, btnLabel: 'Yes, Cancel', btnClass: 'bg-red-500 hover:bg-red-600 text-white', icon: <AlertTriangle className="h-8 w-8 text-red-500" />, iconBg: 'bg-red-50 border-red-100' },
  }[confirmModal.action] : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of recent orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Failed to load orders. Make sure the backend is running.
        </div>
      )}

      {/* ── Mobile card list ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-black/5 bg-white shadow-sm p-4 h-28" />
            ))
          : orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-black/5 bg-white shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewOrder(order)}
                    className="font-semibold text-[#3B82F6] hover:underline underline-offset-2 text-sm"
                  >
                    {order.order_number}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[order.status])}>
                      {order.status}
                    </span>
                    <OrderMenu
                      order={order}
                      onView={() => setViewOrder(order)}
                      onMarkShipped={() => setConfirmModal({ order, action: 'shipped' })}
                      onMarkDelivered={() => setConfirmModal({ order, action: 'delivered' })}
                      onCancel={() => setConfirmModal({ order, action: 'cancel' })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{order.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-foreground">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="text-foreground">{order.items.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

        {/* Mobile pagination */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-primary">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn('h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  page === p ? 'bg-[#3B82F6] text-white' : 'border border-black/10 text-muted-foreground hover:bg-muted/50')}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop table ───────────────────────────────────────────────────── */}
      <div className="hidden md:block rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-muted/20">
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Order ID</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Items</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Total</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {isLoading
              ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
              : orders.map((order) => (
                  <tr key={order.order_number} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button onClick={() => setViewOrder(order)}
                        className="font-medium text-[#3B82F6] hover:text-[#2563EB] hover:underline underline-offset-2 transition-colors">
                        {order.order_number}
                      </button>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-foreground">{order.customer}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{order.date}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{order.items.length}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-foreground">${Number(order.total).toFixed(2)}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', STATUS_STYLES[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <OrderMenu
                        order={order}
                        onView={() => setViewOrder(order)}
                        onMarkShipped={() => setConfirmModal({ order, action: 'shipped' })}
                        onMarkDelivered={() => setConfirmModal({ order, action: 'delivered' })}
                        onCancel={() => setConfirmModal({ order, action: 'cancel' })}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Desktop pagination */}
        <div className="flex items-center justify-between border-t border-black/5 px-5 py-3">
          <p className="text-xs text-primary">
            Showing {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} orders
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn('h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  page === p ? 'bg-[#3B82F6] text-white' : 'border border-black/10 text-muted-foreground hover:bg-muted/50')}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>


      {/* ══ VIEW DETAILS MODAL ═══════════════════════════════════════════════════ */}
      <Dialog open={!!viewOrder} onOpenChange={(o) => !o && setViewOrder(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <DialogTitle className="text-xl font-semibold">Order History</DialogTitle>
          </DialogHeader>

          {viewOrder && (
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="rounded-xl border border-black/8 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-2.5 border-b border-black/5">
                  <div>
                    <p className="font-semibold text-foreground">Order {viewOrder.order_number}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(viewOrder.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', STATUS_STYLES[viewOrder.status])}>
                      {viewOrder.status === 'Delivered' && <CheckCircle className="h-3.5 w-3.5" />}
                      {viewOrder.status === 'Shipped' && <Truck className="h-3.5 w-3.5" />}
                      {viewOrder.status}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-black/5">
                  {viewOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 px-5 py-2.5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-black/5 bg-slate-100">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Package className="h-6 w-6" /></div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Size: {item.size} • Color: {item.color} • Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-foreground shrink-0">${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-2.5 border-t border-black/5 bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    Tracking: <span className="font-mono">{viewOrder.tracking_number || 'N/A'}</span>
                  </p>
                  <p className="text-sm font-bold text-foreground">Total: ${Number(viewOrder.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-black/5 px-6 py-2.5 flex justify-end">
            <Button variant="outline" onClick={() => setViewOrder(null)} className="h-10 px-6 rounded-xl">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ CONFIRM ACTION MODAL ════════════════════════════════════════════════ */}
      <Dialog open={!!confirmModal} onOpenChange={(o) => !o && setConfirmModal(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          {confirmModal && confirmConfig && (
            <>
              <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center gap-4">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-full border', confirmConfig.iconBg)}>
                  {confirmConfig.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{confirmConfig.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{confirmConfig.body}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-black/5 px-8 py-5">
                <Button
                  className={cn('w-full h-11 rounded-xl font-medium gap-2', confirmConfig.btnClass)}
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    if (confirmModal) {
                      const statusMap = {
                        shipped: 'Shipped',
                        delivered: 'Delivered',
                        cancel: 'Cancelled',
                      } as const;
                      applyStatus(confirmModal.order.order_number, statusMap[confirmModal.action]);
                    }
                  }}
                >
                  {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {confirmConfig.btnLabel}
                </Button>
                <Button variant="outline" className="w-full h-11 rounded-xl font-medium" onClick={() => setConfirmModal(null)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
