'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Camera, Save, Loader2, AlertTriangle } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // ── Fetch current admin profile ───────────────────────────────────────────
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: adminService.getProfile,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  // ── Save changes ──────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => adminService.updateProfile(fd),
    onSuccess: (updated) => {
      setFullName(updated.full_name || '');
      setEmail(updated.email || '');
      setPhone(updated.phone || '');
      setAvatarPreview(updated.avatar || null);
      setAvatarFile(null);
      toast.success('Profile updated successfully.');
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    const fd = new FormData();
    fd.append('full_name', fullName);
    fd.append('phone', phone);
    if (avatarFile) fd.append('avatar', avatarFile);
    updateMutation.mutate(fd);
  }

  return (
    <Card className="border border-black/5 shadow-sm">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">Profile Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information and credentials
        </p>
      </div>

      <Separator className="bg-black/5" />

      <CardContent className="p-6 space-y-8">
        {isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Failed to load profile. Make sure the backend is running.
          </div>
        )}

        {/* Avatar */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Profile Picture</Label>
          <div className="relative inline-block mt-1">
            <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md overflow-hidden">
              {isLoading ? (
                <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
              ) : avatarPreview ? (
                <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
              ) : (
                <User className="h-10 w-10 stroke-[1.5]" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile picture"
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          {avatarFile && (
            <p className="text-xs text-muted-foreground mt-2">New picture selected. Click Save Changes to apply.</p>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-5 w-full">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</Label>
            {isLoading
              ? <div className="h-10 bg-muted animate-pulse rounded-md" />
              : <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
            }
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
            {isLoading
              ? <div className="h-10 bg-muted animate-pulse rounded-md" />
              : <Input id="email" type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
            }
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
            {isLoading
              ? <div className="h-10 bg-muted animate-pulse rounded-md" />
              : <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
            }
          </div>
        </div>

        {/* Save */}
        <div>
          <Button
            onClick={handleSave}
            disabled={isLoading || updateMutation.isPending}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-11 px-8 rounded-lg text-sm font-medium gap-2"
          >
            {updateMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
