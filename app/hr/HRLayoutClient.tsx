'use client';

import React, { useState } from 'react';
import { HRSidebar } from '@/components/layout/HRSidebar';
import { HRHeader } from '@/components/layout/HRHeader';
import { ToastProvider } from '@/components/ui/Toast';

export function HRLayoutClient({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = user?.name || 'HR Administrator';
  const userEmail = user?.email || 'hr.admin@corporate.com';
  const userSubtitle = user?.subtitle || 'HR Admin • Corporate Operations';
  const userInitials = user?.initials || 'HR';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
        <HRSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <HRHeader
            userName={userName}
            userEmail={userEmail}
            userRole="HR_ADMIN"
            userSubtitle={userSubtitle}
            userInitials={userInitials}
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
