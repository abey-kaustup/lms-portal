'use client';

import React, { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { HRSidebar } from '@/components/layout/HRSidebar';
import { HRHeader } from '@/components/layout/HRHeader';
import { ToastProvider } from '@/components/ui/Toast';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
        {/* Widescreen Sidebar */}
        <HRSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

        {/* Main Fluid Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          <HRHeader onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto space-y-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
