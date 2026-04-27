import React from 'react';
import Link from 'next/link';
import { User, Shield } from 'lucide-react';
import { SettingsNav } from '@/components/dashboard/SettingsNav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar inside settings */}
        <div className="w-full md:w-64 shrink-0">
          <SettingsNav />
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
