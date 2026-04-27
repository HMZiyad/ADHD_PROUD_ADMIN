'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, MoreVertical,
  Eye, Pencil, Trash2, AlertTriangle, RefreshCw,
  Mail, ShoppingBag, Calendar, DollarSign, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminService, AdminCustomer } from '@/services/admin.service';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const ORDER_STATUS_STYLES: Record<string, string> = {
  Pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Shipped:   'bg-gray-100 text-gray-600 border border-gray-200',
  Delivered: 'bg-green-50 text-green-700 border border-green-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

// ── Avatar initials ────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }[size];
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', color, sizeClass)}>
      {initials}
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-3 whitespace-nowrap">
          <div className="h-4 bg-muted/60 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}

// ── Kebab Menu ─────────────────────────────────────────────────────────────────
function CustomerMenu({ customer, onView, onEdit, onDelete }: {
  customer: AdminCustomer;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
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
          <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted/50 transition-colors text-foreground">
            <Pencil className="h-4 w-4 text-muted-foreground" /> Edit Customer
          </button>
          <div className="my-1 border-t border-black/5" />
          <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-500">
            <Trash2 className="h-4 w-4" /> Delete Customer
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState<AdminCustomer | null>(null);
  const [editCustomer, setEditCustomer] = useState<AdminCustomer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<AdminCustomer | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminCustomers', page],
    queryFn: () => adminService.getCustomers(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const customers = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: number; name: string; email: string; phone: string }) =>
      adminService.updateCustomer(id, { name: body.name, email: body.email, phone: body.phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
      setEditCustomer(null);
      toast.success('Customer updated.');
    },
    onError: () => toast.error('Failed to update customer.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
      setDeleteCustomer(null);
      toast.success('Customer deleted.');
    },
    onError: () => toast.error('Failed to delete customer.'),
  });

  function openEdit(c: AdminCustomer) {
    setEditCustomer(c);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone);
  }

  function saveEdit() {
    if (!editCustomer) return;
    updateMutation.mutate({ id: editCustomer.id, name: editName, email: editEmail, phone: editPhone });
  }

  function confirmDelete() {
    if (!deleteCustomer) return;
    deleteMutation.mutate(deleteCustomer.id);
  }

  const Pagination = () => (
    <div className="flex items-center gap-1">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground mt-1">Overview of all customer details</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Failed to load customers. Make sure the backend is running.
        </div>
      )}

      {/* ── Mobile cards ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 md:hidden">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-black/5 bg-white shadow-sm p-4 h-28" />
            ))
          : customers.map(c => (
              <div key={c.id} className="rounded-xl border border-black/5 bg-white shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={c.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      c.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200')}>
                      {c.status}
                    </span>
                    <CustomerMenu customer={c} onView={() => setViewCustomer(c)} onEdit={() => openEdit(c)} onDelete={() => setDeleteCustomer(c)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-semibold text-foreground">${Number(c.total_spent).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-foreground">{c.total_orders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Order</p>
                    <p className="text-foreground">{c.last_order_date || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-primary">{totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}</p>
          <Pagination />
        </div>
      </div>

      {/* ── Desktop table ─────────────────────────────────────────────── */}
      <div className="hidden md:block rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-muted/20">
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Spent</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Orders</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Last Order</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {isLoading
              ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
              : customers.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <button
                          onClick={() => setViewCustomer(c)}
                          className="font-medium text-foreground hover:text-[#3B82F6] hover:underline underline-offset-2 transition-colors text-sm"
                        >
                          {c.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{c.email}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap font-medium text-foreground">${Number(c.total_spent).toFixed(2)}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{c.total_orders}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{c.last_order_date || '—'}</td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <CustomerMenu customer={c} onView={() => setViewCustomer(c)} onEdit={() => openEdit(c)} onDelete={() => setDeleteCustomer(c)} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-black/5 px-5 py-3">
          <p className="text-xs text-primary">Showing {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} customers</p>
          <Pagination />
        </div>
      </div>

      {/* ══ VIEW DETAILS MODAL ════════════════════════════════════════════════ */}
      <Dialog open={!!viewCustomer} onOpenChange={o => !o && setViewCustomer(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <DialogTitle className="text-xl font-semibold">Customer Details</DialogTitle>
          </DialogHeader>

          {viewCustomer && (
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-black/5">
                <Avatar name={viewCustomer.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{viewCustomer.name}</h3>
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      viewCustomer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200')}>
                      {viewCustomer.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{viewCustomer.email}</p>
                  <p className="text-sm text-muted-foreground">{viewCustomer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-black/5 border-b border-black/5">
                {[
                  { label: 'Total Spent', value: `$${Number(viewCustomer.total_spent).toFixed(2)}`, icon: DollarSign },
                  { label: 'Total Orders', value: viewCustomer.total_orders, icon: ShoppingBag },
                  { label: 'Member Since', value: viewCustomer.joined, icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex flex-col items-center gap-1 py-2.5 px-3 text-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base font-semibold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-2.5">
                <h4 className="text-sm font-semibold mb-3">Order History</h4>
                {viewCustomer.order_history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="rounded-xl border border-black/8 overflow-hidden divide-y divide-black/5">
                    {viewCustomer.order_history.map(o => (
                      <div key={o.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{o.id}</p>
                          <p className="text-xs text-muted-foreground">{o.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ORDER_STATUS_STYLES[o.status])}>
                            {o.status}
                          </span>
                          <span className="text-sm font-semibold text-foreground">${Number(o.total).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-black/5 px-6 py-2.5 flex justify-end">
            <Button variant="outline" onClick={() => setViewCustomer(null)} className="h-10 px-6 rounded-xl">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT CUSTOMER MODAL ══════════════════════════════════════════════ */}
      <Dialog open={!!editCustomer} onOpenChange={o => !o && setEditCustomer(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-500">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-[#3B82F6]">Edit Customer</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Update customer information</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="editCustName">Full Name</Label>
              <Input id="editCustName" value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editCustEmail">Email Address</Label>
              <Input id="editCustEmail" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editCustPhone">Phone Number</Label>
              <Input id="editCustPhone" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 border-t border-black/5 px-6 py-2.5">
            <Button variant="outline" onClick={() => setEditCustomer(null)} className="w-full sm:w-auto h-10 px-6 rounded-xl">Cancel</Button>
            <Button
              onClick={saveEdit}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ DELETE CONFIRMATION MODAL ════════════════════════════════════════ */}
      <Dialog open={!!deleteCustomer} onOpenChange={o => !o && setDeleteCustomer(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Delete Customer?</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">&ldquo;{deleteCustomer?.name}&rdquo;</span>?<br />
                All their data and order history will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-black/5 px-8 py-5">
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium gap-2"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Yes, Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteCustomer(null)} className="w-full h-11 rounded-xl font-medium">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
