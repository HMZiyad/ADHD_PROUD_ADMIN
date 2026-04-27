'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              Set a new password
            </h1>
            <p className="text-sm text-muted-foreground mt-2 px-4 leading-relaxed">
              Create a new password. Ensure it differs from previous ones for security
            </p>
          </div>

          <CardContent className="p-0">
            <form 
              className="space-y-6" 
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/password-updated'); // Redirect to success notification
              }}
            >
              {/* New Password Area */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="*********"
                    className="h-12 bg-background pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Area */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="*********"
                    className="h-12 bg-background pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <Button type="submit" className="w-full h-12 text-md font-medium text-white shadow-md hover:shadow-lg transition-all rounded-md mt-6" style={{ backgroundColor: '#3B82F6' }}>
                Confirm
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
