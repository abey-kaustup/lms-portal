'use client';

import React, { useState } from 'react';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { HRHeader } from '@/components/layout/HRHeader';
import { ToastProvider } from '@/components/ui/Toast';

export function EmployeeLayoutClient({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = user?.name || 'Employee';
  const userEmail = user?.email || 'user@corporate.local';
  const userSubtitle = user?.subtitle || `${user?.employeeId || 'EMP'} • ${user?.department || 'Department'} • ${user?.designation || 'Staff'}`;
  const userInitials = user?.initials || 'EM';

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors">
        <EmployeeSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          employeeName={userName}
          departmentName={`${user?.department || 'Department'} • ${user?.designation || 'Staff'}`}
          isMasterTester={user?.isMasterTester}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <HRHeader
            userName={userName}
            userEmail={userEmail}
            userRole="EMPLOYEE"
            userSubtitle={userSubtitle}
            userInitials={userInitials}
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          />
          <main className="flex-1 p-3.5 sm:p-4 lg:p-4.5 w-full max-w-[1750px] mx-auto flex flex-col justify-between overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
