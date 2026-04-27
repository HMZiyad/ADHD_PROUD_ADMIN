'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, ShoppingCart, Users, LogOut, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Overview' },
  { href: '/products', icon: Box, label: 'Product' },
  { href: '/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/blog', icon: NotebookPen, label: 'Blog' },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden h-screen w-64 flex-col border-r-0 md:flex bg-linear-to-b from-[#2A77DB] to-[#000000] text-white sticky top-0 self-start">
      <Link href="/" className="flex h-32 items-center justify-center border-b border-white/10 px-4 mt-2 hover:opacity-90 transition-opacity">
        <div className="relative h-24 w-48">
          <Image
            src="/logo_dark.png"
            alt="ADHD Proud"
            fill
            sizes="200px"
            className="object-contain invert brightness-0 saturate-100"
          />
        </div>
      </Link>

      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-4">
          <span className="text-xs font-semibold text-white/50 tracking-wider">MAIN MENU</span>
        </div>
        <nav className="grid gap-2 px-4">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all",
                isActive(href)
                  ? "bg-[#1E1B4B]/60 text-white font-medium border border-white/5"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          onClick={() => {
            document.cookie = 'auth_token=; path=/; max-age=0';
            window.location.href = '/login';
          }}
          className="w-full flex flex-row justify-center items-center gap-3 px-3 py-3 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
