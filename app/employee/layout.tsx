'use client';

import React, { useState } from 'react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { HRHeader } from '@/components/layout/HRHeader';
import { ToastProvider } from '@/components/ui/Toast';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
        <EmployeeSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <HRHeader
            userName="John Doe"
            userEmail="john.doe@corporate.com"
            userRole="IT Staff Employee"
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
