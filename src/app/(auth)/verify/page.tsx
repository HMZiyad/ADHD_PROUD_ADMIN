'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function VerifyPage() {
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
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground mt-2 px-2 leading-relaxed">
              We sent a code to your email address. Please check your email for the 6 digit code.
            </p>
          </div>

          <CardContent className="p-0 flex flex-col items-center">
            <form 
              className="space-y-6 w-full" 
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/reset-password');
              }}
            >
              
              {/* Specialized 6-digit OTP Component centered */}
              <div className="flex justify-center my-8">
                <InputOTP maxLength={6}>
                  <InputOTPGroup className="gap-2 sm:gap-3 flex">
                    <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                    <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                    <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                    <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                    <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                    <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-xl rounded-lg border shadow-sm bg-background" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Submit Action */}
              <Button type="submit" className="w-full h-12 text-md font-medium text-white shadow-md hover:shadow-lg transition-all rounded-md" style={{ backgroundColor: '#3B82F6' }}>
                Verify
              </Button>
            </form>

            <div className="mt-6 text-sm text-center">
              <span className="text-muted-foreground">You have not received the email? </span>
              <button 
                type="button"
                className="font-medium text-[#3B82F6] hover:underline hover:text-primary/90 transition-colors"
                onClick={() => console.log('Resending code...')}
              >
                Resend
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
