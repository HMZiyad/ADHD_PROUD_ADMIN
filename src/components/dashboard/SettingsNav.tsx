'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <Card className="p-2 border border-black/5 shadow-sm space-y-1">
      <Link href="/settings/profile">
        <div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            pathname === '/settings/profile' || pathname === '/settings'
              ? "bg-muted/60 text-foreground font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </div>
      </Link>
      <Link href="/settings/security">
        <div 
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            pathname === '/settings/security'
              ? "bg-muted/60 text-foreground font-medium"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Shield className="h-5 w-5" />
          <span>Security</span>
        </div>
      </Link>
    </Card>
  );
}
