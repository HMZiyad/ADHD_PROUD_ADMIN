'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PasswordUpdatedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[520px]"
      >
        <Card className="border shadow-lg shadow-black/5 bg-card/95 backdrop-blur-sm overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-8 h-20 w-48 relative">
              <Image 
                src="/logo_dark.png" 
                alt="ADHD Proud Logo" 
                fill 
                sizes="200px"
                className="object-contain dark:invert"
                priority
              />
            </div>
            
            <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
              Password Updated<br/>Successfully!
            </h1>
            <p className="text-sm text-muted-foreground mt-4 px-6 leading-relaxed">
              Your new password has been saved. You can now continue securely.
            </p>
          </div>

          <CardContent className="p-0">
            {/* Submit Action */}
            <Button 
              onClick={() => router.push('/login')}
              className="w-full h-12 text-md font-medium text-white shadow-md hover:shadow-lg transition-all rounded-md mt-2" 
              style={{ backgroundColor: '#3B82F6' }}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
