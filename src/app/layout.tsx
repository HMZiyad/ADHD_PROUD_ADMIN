import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import DashboardProvider from '@/providers/DashboardProvider';
import { Toaster } from '@/components/ui/sonner';

// Apply Manrope typography
const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard | Elnataan',
  description: 'Next-generation admin dashboard built with Next.js and Shadcn',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.className} antialiased`}>
      <body className="h-screen overflow-hidden bg-background text-foreground">
        <DashboardProvider>
          {children}
          <Toaster position="top-right" richColors />
        </DashboardProvider>
      </body>
    </html>
  );
}
