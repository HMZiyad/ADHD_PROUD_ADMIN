'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactLenis } from 'lenis/react';
import React, { useEffect, useState } from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface DashboardProviderProps {
  children: React.ReactNode;
}

export default function DashboardProvider({ children }: DashboardProviderProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the device is mobile to optimize Lenis or disable it if it feels too heavy
    const checkMobile = () => {
      // Basic check using matchMedia for typical mobile breakpoints and touch capability
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isTouch || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactLenis
        root
        options={{
          lerp: isMobile ? 0.2 : 0.1, // Increase lerp for snappier feel on mobile, smoother on desktop
          smoothWheel: true,
          // Mobile touch is usually handled natively by Lenis, but we can tune syncTouch if needed
          syncTouch: !isMobile, 
        }}
      >
        {children}
      </ReactLenis>
      {/* Devtools won't be included in production builds automatically */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
