'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeMutation = useMutation({
    mutationFn: () => authService.changePassword(currentPassword, newPassword, confirmPassword),
    onSuccess: () => {
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.detail
        || (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Failed to change password. Check your current password and try again.';
      setError(msg);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    changeMutation.mutate();
  }

  return (
    <Card className="border border-black/5 shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ensure your account uses a strong, unique password
        </p>
      </div>

      <Separator className="bg-black/5" />

      <CardContent className="p-6 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Update */}
          <div>
            <Button
              type="submit"
              disabled={changeMutation.isPending}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-11 px-8 rounded-lg text-sm font-medium gap-2"
            >
              {changeMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
              ) : (
                <><Save className="h-4 w-4" /> Update Password</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
