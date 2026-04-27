'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight, X, ShoppingCart, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MobileNav } from '@/components/layout/MobileNav';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, AdminNotification } from '@/services/admin.service';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order': return { icon: ShoppingCart, bg: 'bg-blue-100 text-blue-600' };
    case 'payment': return { icon: CreditCard, bg: 'bg-emerald-100 text-emerald-600' };
    case 'stock': return { icon: AlertCircle, bg: 'bg-amber-100 text-amber-600' };
    default: return { icon: Clock, bg: 'bg-purple-100 text-purple-600' };
  }
};

export function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => adminService.getNotifications(),
    staleTime: 60_000,
    retry: false, // Don't spam retries if endpoint doesn't exist yet
  });

  const markReadMutation = useMutation({
    mutationFn: () => adminService.markNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
  });

  const PREVIEW_NOTIFICATIONS = notifications.slice(0, 2);
  const UNREAD_COUNT = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <MobileNav />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 relative group hover:text-primary rounded-full hover:bg-accent h-9 w-9 bg-transparent border-0 cursor-pointer">
              <Bell className="h-5 w-5" />
              {UNREAD_COUNT > 0 && (
                <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-lg border-black/5">
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                <span className="font-semibold text-sm">Notifications</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{UNREAD_COUNT} unread</Badge>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-auto">
                {PREVIEW_NOTIFICATIONS.map((n) => (
                  <button key={n.id} className="flex flex-col items-start px-4 py-3 hover:bg-muted/50 border-b border-black/5 last:border-0 transition-colors text-left">
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">{n.body}</span>
                    <span className="text-xs text-muted-foreground/60 mt-2">{n.time}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-black/5 p-2">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-primary"
                  size="sm"
                  onClick={() => setNotifModalOpen(true)}
                >
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Popover */}
          <Popover open={profileOpen} onOpenChange={setProfileOpen}>
            <PopoverTrigger className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-muted/50 transition-colors bg-transparent border-0 outline-none text-left focus-visible:ring-2 focus-visible:ring-primary/20">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium leading-none mb-1">Jon Kabir</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-transform hover:scale-105 active:scale-95">
                <AvatarImage src="https://i.pravatar.cc/150?img=11" alt="Dr. Jon Kabir" />
                <AvatarFallback>JK</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[340px] p-0 shadow-xl border-black/5 rounded-xl">
              <div className="flex items-start justify-between p-5 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 shadow-sm">
                    <AvatarImage src="https://i.pravatar.cc/150?img=11" alt="Dr. Jon Kabir" />
                    <AvatarFallback>JK</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xl font-medium text-foreground tracking-tight">Dr. Jon Kabir</span>
                    <Badge variant="secondary" className="px-3 py-0.5 rounded-full font-normal shadow-none border border-black/5">
                      Admin
                    </Badge>
                  </div>
                </div>
                <PopoverPrimitive.Close className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-transparent border-0 cursor-pointer" aria-label="Close">
                  <X className="h-6 w-6 stroke-[1.5]" />
                </PopoverPrimitive.Close>
              </div>

              <Separator className="bg-black/10 mx-5 w-auto" />

              <div className="flex flex-col p-2 mt-1 gap-1">
                <button
                  onClick={() => { setProfileOpen(false); router.push('/settings/profile'); }}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted/60 transition-colors outline-none focus:bg-muted/80"
                >
                  <span className="text-[17px] font-medium text-foreground tracking-tight">Profile</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); router.push('/settings/security'); }}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted/60 transition-colors outline-none focus:bg-muted/80"
                >
                  <span className="text-[17px] font-medium text-foreground tracking-tight">Settings</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                </button>
              </div>

              <div className="p-5 pt-2">
                <Button
                  onClick={() => { setProfileOpen(false); router.push('/login'); }}
                  className="w-full h-12 text-base font-medium text-white shadow-sm hover:shadow transition-all rounded-md"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  Log out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* ── All Notifications Modal ─────────────────────────────────────────── */}
      <Dialog open={notifModalOpen} onOpenChange={setNotifModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-black/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-base font-semibold">All Notifications</DialogTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">{UNREAD_COUNT} unread</Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col max-h-[60vh] overflow-y-auto divide-y divide-black/5">
            {notifications.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-sm">No notifications</div>
            ) : notifications.map((n) => {
              const { icon: Icon, bg: iconBg } = getNotificationIcon(n.type);
              return (
                <button
                  key={n.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4 text-left hover:bg-muted/50 transition-colors w-full",
                    n.unread && "bg-primary/3"
                  )}
                >
                  {/* Icon badge */}
                  <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("text-sm", n.unread ? "font-semibold" : "font-medium")}>{n.title}</span>
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"></span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    <span className="text-[11px] text-muted-foreground/60 mt-1.5 block">{n.time}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-black/5 px-6 py-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => markReadMutation.mutate()}
              disabled={markReadMutation.isPending || UNREAD_COUNT === 0}
            >
              Mark all as read
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
