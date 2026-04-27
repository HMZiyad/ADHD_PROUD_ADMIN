'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
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
            <div className="mb-6 h-20 w-48 relative">
              <Image 
                src="/logo_dark.png" 
                alt="ADHD Proud Logo" 
                fill 
                sizes="200px"
                className="object-contain dark:invert"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Forget Password?
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Please enter your email to get verification code
            </p>
          </div>

          <CardContent className="p-0">
            <form 
              className="space-y-6" 
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/verify');
              }}
            >
              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="esteban_schiller@gmail.com"
                  className="h-12 bg-background"
                  required
                />
              </div>

              {/* Submit Action */}
              <Button type="submit" className="w-full h-12 text-md font-medium text-white shadow-md hover:shadow-lg transition-all rounded-md mt-6" style={{ backgroundColor: '#3B82F6' }}>
                Send OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
